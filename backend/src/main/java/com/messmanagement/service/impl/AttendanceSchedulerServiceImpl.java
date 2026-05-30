package com.messmanagement.service.impl;

import com.messmanagement.entity.AttendanceLog;
import com.messmanagement.entity.Customer;
import com.messmanagement.entity.MessSettings;
import com.messmanagement.entity.enums.ActionType;
import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.entity.enums.MealPlan;
import com.messmanagement.entity.enums.SourceType;
import com.messmanagement.repository.AttendanceLogRepository;
import com.messmanagement.repository.CustomerRepository;
import com.messmanagement.repository.MessSettingsRepository;
import com.messmanagement.security.SecurityUtils;
import com.messmanagement.service.AttendanceSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceSchedulerServiceImpl implements AttendanceSchedulerService {

    private final CustomerRepository customerRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final MessSettingsRepository messSettingsRepository;

    /**
     * Runs every minute. Checks if we've hit the lunch or dinner cutoff time
     * for any mess, and auto-marks present for eligible customers who haven't skipped.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkAndMarkAttendance() {
        try {
            List<MessSettings> allSettings = messSettingsRepository.findAllWithMess();

            for (MessSettings settings : allSettings) {
                if (!Boolean.TRUE.equals(settings.getAutoMarkEnabled()) || settings.getMess() == null) {
                    continue;
                }

                try {
                    ZoneId zone = ZoneId.of(settings.getTimezone());
                    ZonedDateTime now = ZonedDateTime.now(zone);
                    LocalTime currentTime = now.toLocalTime();
                    LocalDate today = now.toLocalDate();

                    LocalTime lunchCutoff = settings.getLunchCutoffTime();
                    LocalTime dinnerCutoff = settings.getDinnerCutoffTime();

                    // Check if current minute matches the cutoff
                    if (isWithinMinute(currentTime, lunchCutoff)) {
                        markLunchAttendanceForMess(settings.getMess().getId(), today);
                    }

                    if (isWithinMinute(currentTime, dinnerCutoff)) {
                        markDinnerAttendanceForMess(settings.getMess().getId(), today);
                    }
                } catch (Exception e) {
                    log.error("Error in attendance scheduler for mess settings {}: {}", settings.getId(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error retrieving all mess settings in scheduler: {}", e.getMessage(), e);
        }
    }

    private boolean isWithinMinute(LocalTime current, LocalTime target) {
        return current.getHour() == target.getHour()
                && current.getMinute() == target.getMinute();
    }

    @Override
    @Transactional
    public void markLunchAttendance() {
        UUID messId = SecurityUtils.getCurrentMessId();
        markLunchAttendanceForMess(messId, LocalDate.now());
    }

    @Override
    @Transactional
    public void markDinnerAttendance() {
        UUID messId = SecurityUtils.getCurrentMessId();
        markDinnerAttendanceForMess(messId, LocalDate.now());
    }

    private void markLunchAttendanceForMess(UUID messId, LocalDate date) {
        log.info("Auto-marking lunch attendance for mess {} on date: {}", messId, date);
        List<Customer> customers = customerRepository.findActiveCustomersForAutoMark(
                messId,
                CustomerStatus.Active,
                List.of(MealPlan.Lunch, MealPlan.Both),
                date,
                MealPlan.Lunch
        );

        int marked = 0;
        for (Customer customer : customers) {
            createPresentLog(customer, date, MealPlan.Lunch);
            marked++;
        }
        log.info("Auto-marked {} customers as present for lunch in mess {} on {}", marked, messId, date);
    }

    private void markDinnerAttendanceForMess(UUID messId, LocalDate date) {
        log.info("Auto-marking dinner attendance for mess {} on date: {}", messId, date);
        List<Customer> customers = customerRepository.findActiveCustomersForAutoMark(
                messId,
                CustomerStatus.Active,
                List.of(MealPlan.Dinner, MealPlan.Both),
                date,
                MealPlan.Dinner
        );

        int marked = 0;
        for (Customer customer : customers) {
            createPresentLog(customer, date, MealPlan.Dinner);
            marked++;
        }
        log.info("Auto-marked {} customers as present for dinner in mess {} on {}", marked, messId, date);
    }

    private void createPresentLog(Customer customer, LocalDate date, MealPlan meal) {
        AttendanceLog log = new AttendanceLog();
        log.setDate(date);
        log.setCustomer(customer);
        log.setCustomerName(customer.getName());
        log.setMeal(meal);
        log.setAction(ActionType.Present);
        log.setSource(SourceType.System);
        log.setMess(customer.getMess());
        attendanceLogRepository.save(log);

        customer.setMealsUsed(customer.getMealsUsed() + 1);
        customerRepository.save(customer);
    }
}
