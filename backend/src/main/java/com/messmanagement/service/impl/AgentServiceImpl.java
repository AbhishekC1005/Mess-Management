package com.messmanagement.service.impl;

import com.messmanagement.dto.request.AgentBulkSkipRequest;
import com.messmanagement.dto.request.AgentSkipRequest;
import com.messmanagement.dto.response.AgentCustomerResponse;
import com.messmanagement.dto.response.AttendanceLogResponse;
import com.messmanagement.entity.AttendanceLog;
import com.messmanagement.entity.Customer;
import com.messmanagement.entity.enums.ActionType;
import com.messmanagement.entity.enums.SourceType;
import com.messmanagement.exception.BadRequestException;
import com.messmanagement.exception.ResourceNotFoundException;
import com.messmanagement.mapper.AttendanceLogMapper;
import com.messmanagement.repository.AttendanceLogRepository;
import com.messmanagement.repository.CustomerRepository;
import com.messmanagement.repository.DailyMenuRepository;
import com.messmanagement.repository.MessSettingsRepository;
import com.messmanagement.entity.DailyMenu;
import com.messmanagement.entity.MessSettings;
import com.messmanagement.dto.response.MessSettingsResponse;
import com.messmanagement.service.AgentService;
import lombok.RequiredArgsConstructor;
import com.messmanagement.entity.CustomerFeedback;
import com.messmanagement.repository.CustomerFeedbackRepository;
import com.messmanagement.dto.request.AgentFeedbackRequest;
import com.messmanagement.dto.request.AgentCorrectAttendanceRequest;
import com.messmanagement.entity.enums.MealPlan;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AgentServiceImpl implements AgentService {
    
    private final CustomerRepository customerRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final AttendanceLogMapper attendanceLogMapper;
    private final DailyMenuRepository dailyMenuRepository;
    private final MessSettingsRepository messSettingsRepository;
    private final CustomerFeedbackRepository customerFeedbackRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<AgentCustomerResponse> findCustomerByPhone(String phone) {
        List<Customer> customers = customerRepository.findAllByPhone(phone);
        List<AgentCustomerResponse> responses = new ArrayList<>();
        for (Customer customer : customers) {
            responses.add(toAgentCustomerResponse(customer));
        }
        return responses;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AgentCustomerResponse> findCustomerByTelegramChatId(Long telegramChatId) {
        List<Customer> customers = customerRepository.findAllByTelegramChatId(telegramChatId);
        List<AgentCustomerResponse> responses = new ArrayList<>();
        for (Customer customer : customers) {
            responses.add(toAgentCustomerResponse(customer));
        }
        return responses;
    }
    
    @Override
    public AttendanceLogResponse skipMeal(AgentSkipRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        
        if (customer.getStatus() != com.messmanagement.entity.enums.CustomerStatus.Active) {
            throw new BadRequestException("Customer is not active, cannot skip meal");
        }
        
        AttendanceLog log = new AttendanceLog();
        log.setDate(request.getDate());
        log.setCustomer(customer);
        log.setCustomerName(customer.getName());
        log.setMeal(request.getMeal());
        log.setAction(ActionType.Skipped);
        log.setSource(SourceType.Bot);
        log.setMess(customer.getMess());
        
        customer.setSkippedCount(customer.getSkippedCount() + 1);
        customerRepository.save(customer);
        
        AttendanceLog saved = attendanceLogRepository.save(log);
        return attendanceLogMapper.toResponse(saved);
    }
    
    @Override
    public List<AttendanceLogResponse> bulkSkipMeals(AgentBulkSkipRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        
        if (customer.getStatus() != com.messmanagement.entity.enums.CustomerStatus.Active) {
            throw new BadRequestException("Customer is not active, cannot skip meals");
        }
        
        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();
        
        if (start.isAfter(end)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }
        
        List<AttendanceLogResponse> results = new ArrayList<>();
        
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            AttendanceLog log = new AttendanceLog();
            log.setDate(date);
            log.setCustomer(customer);
            log.setCustomerName(customer.getName());
            log.setMeal(request.getMeal());
            log.setAction(ActionType.Skipped);
            log.setSource(SourceType.Bot);
            log.setMess(customer.getMess());
            
            AttendanceLog saved = attendanceLogRepository.save(log);
            results.add(attendanceLogMapper.toResponse(saved));
        }
        
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        customer.setSkippedCount(customer.getSkippedCount() + (int) daysBetween);
        customerRepository.save(customer);
        
        return results;
    }
    
    @Override
    public AgentCustomerResponse pauseSubscription(UUID customerId) {
        Customer customer = customerRepository.findByIdWithPauseHistory(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        
        if (customer.getStatus() == com.messmanagement.entity.enums.CustomerStatus.Paused) {
            throw new BadRequestException("Customer is already paused");
        }
        
        customer.setStatus(com.messmanagement.entity.enums.CustomerStatus.Paused);
        
        com.messmanagement.entity.PauseHistory pauseHistory = new com.messmanagement.entity.PauseHistory();
        pauseHistory.setCustomer(customer);
        pauseHistory.setStartDate(LocalDate.now());
        
        customer.getPauseHistory().add(pauseHistory);
        
        // Log the pause action
        AttendanceLog log = new AttendanceLog();
        log.setDate(LocalDate.now());
        log.setCustomer(customer);
        log.setCustomerName(customer.getName());
        log.setMeal(customer.getPlan());
        log.setAction(ActionType.Paused);
        log.setSource(SourceType.Bot);
        log.setMess(customer.getMess());
        attendanceLogRepository.save(log);
        
        Customer updated = customerRepository.save(customer);
        return toAgentCustomerResponse(updated);
    }
    
    @Override
    public AgentCustomerResponse resumeSubscription(UUID customerId) {
        Customer customer = customerRepository.findByIdWithPauseHistory(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        
        if (customer.getStatus() != com.messmanagement.entity.enums.CustomerStatus.Paused) {
            throw new BadRequestException("Customer is not paused");
        }
        
        customer.setStatus(com.messmanagement.entity.enums.CustomerStatus.Active);
        
        if (!customer.getPauseHistory().isEmpty()) {
            com.messmanagement.entity.PauseHistory latest = customer.getPauseHistory()
                    .get(customer.getPauseHistory().size() - 1);
            if (latest.getEndDate() == null) {
                latest.setEndDate(LocalDate.now());
            }
        }
        
        // Log the resume action
        AttendanceLog log = new AttendanceLog();
        log.setDate(LocalDate.now());
        log.setCustomer(customer);
        log.setCustomerName(customer.getName());
        log.setMeal(customer.getPlan());
        log.setAction(ActionType.Resumed);
        log.setSource(SourceType.Bot);
        log.setMess(customer.getMess());
        attendanceLogRepository.save(log);
        
        Customer updated = customerRepository.save(customer);
        return toAgentCustomerResponse(updated);
    }
    
    @Override
    public AgentCustomerResponse updateTelegramChatId(UUID customerId, Long telegramChatId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        
        customer.setTelegramChatId(telegramChatId);
        Customer updated = customerRepository.save(customer);
        return toAgentCustomerResponse(updated);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AgentCustomerResponse getSubscriptionDetails(UUID customerId) {
        Customer customer = customerRepository.findByIdWithPauseHistory(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        return toAgentCustomerResponse(customer);
    }
    
    private AgentCustomerResponse toAgentCustomerResponse(Customer customer) {
        AgentCustomerResponse response = new AgentCustomerResponse();
        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setPlan(customer.getPlan());
        response.setStatus(customer.getStatus());
        response.setMealsUsed(customer.getMealsUsed());
        response.setTotalMeals(customer.getTotalMeals());
        response.setAmountDue(customer.getAmountDue());
        response.setJoinDate(customer.getJoinDate());
        response.setSkippedCount(customer.getSkippedCount());
        response.setPhone(customer.getPhone());
        response.setTelegramChatId(customer.getTelegramChatId());
        
        if (customer.getMess() != null) {
            response.setMessId(customer.getMess().getId());
            response.setMessName(customer.getMess().getName());
        }
        
        return response;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getTodayMenu(UUID messId) {
        LocalDate today = LocalDate.now();
        Optional<DailyMenu> menuOpt = dailyMenuRepository.findByMessIdAndDate(messId, today);
        if (menuOpt.isEmpty()) {
            return Map.of("menu", "Menu not available for today.");
        }
        DailyMenu menu = menuOpt.get();
        StringBuilder sb = new StringBuilder();
        
        sb.append("🍱 *Lunch Menu:*\n");
        sb.append(menu.getLunchMenu() != null && !menu.getLunchMenu().trim().isEmpty() 
                ? menu.getLunchMenu() : "Not decided yet");
        sb.append("\n\n");
        sb.append("🍛 *Dinner Menu:*\n");
        sb.append(menu.getDinnerMenu() != null && !menu.getDinnerMenu().trim().isEmpty() 
                ? menu.getDinnerMenu() : "Not decided yet");
                
        return Map.of("menu", sb.toString());
    }
    
    @Override
    @Transactional(readOnly = true)
    public MessSettingsResponse getSettings(UUID messId) {
        MessSettings settings = messSettingsRepository.findByMessId(messId)
                .orElseThrow(() -> new com.messmanagement.exception.ResourceNotFoundException("Mess settings not found for mess: " + messId));
                
        MessSettingsResponse response = new MessSettingsResponse();
        response.setId(settings.getId());
        response.setLunchCutoffTime(settings.getLunchCutoffTime());
        response.setDinnerCutoffTime(settings.getDinnerCutoffTime());
        response.setAutoMarkEnabled(settings.getAutoMarkEnabled());
        response.setTimezone(settings.getTimezone());
        response.setUpdatedAt(settings.getUpdatedAt());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgentCustomerResponse> getAllCustomersWithTelegram() {
        List<Customer> customers = customerRepository.findAllByTelegramChatIdIsNotNull();
        List<AgentCustomerResponse> responses = new ArrayList<>();
        for (Customer customer : customers) {
            responses.add(toAgentCustomerResponse(customer));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgentCustomerResponse> getCustomersWithDuePayments() {
        List<Customer> customers = customerRepository.findCustomersWithDuePayments();
        List<AgentCustomerResponse> responses = new ArrayList<>();
        for (Customer customer : customers) {
            responses.add(toAgentCustomerResponse(customer));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgentCustomerResponse> getCustomersNearExpiry(int daysRemaining) {
        List<Customer> customers = customerRepository.findCustomersNearExpiry(daysRemaining * 2);
        List<AgentCustomerResponse> responses = new ArrayList<>();
        for (Customer customer : customers) {
            int remainingMeals = customer.getTotalMeals() - customer.getMealsUsed();
            int calculatedDays;
            if (customer.getPlan() == MealPlan.Both) {
                calculatedDays = (int) Math.ceil(remainingMeals / 2.0);
            } else {
                calculatedDays = remainingMeals;
            }
            if (calculatedDays <= daysRemaining) {
                AgentCustomerResponse resp = toAgentCustomerResponse(customer);
                resp.setDaysRemaining(calculatedDays);
                responses.add(resp);
            }
        }
        return responses;
    }

    @Override
    public Map<String, Object> recordFeedback(AgentFeedbackRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        CustomerFeedback feedback = new CustomerFeedback();
        feedback.setCustomer(customer);
        feedback.setMeal(request.getMeal());
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setDate(LocalDate.now());

        CustomerFeedback saved = customerFeedbackRepository.save(feedback);
        return Map.of(
            "status", "success",
            "message", "Feedback recorded successfully",
            "feedbackId", saved.getId()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> adminBroadcast(String message) {
        List<Customer> customers = customerRepository.findAllByTelegramChatIdIsNotNull();
        long activeCount = customers.stream()
                .filter(c -> c.getStatus() == com.messmanagement.entity.enums.CustomerStatus.Active)
                .count();

        return Map.of(
            "status", "success",
            "count", activeCount
        );
    }

    @Override
    public AttendanceLogResponse adminCorrectAttendance(AgentCorrectAttendanceRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        MealPlan mealPlan;
        if ("lunch".equalsIgnoreCase(request.getMeal())) {
            mealPlan = MealPlan.Lunch;
        } else if ("dinner".equalsIgnoreCase(request.getMeal())) {
            mealPlan = MealPlan.Dinner;
        } else if ("both".equalsIgnoreCase(request.getMeal())) {
            mealPlan = MealPlan.Both;
        } else {
            throw new BadRequestException("Invalid meal: " + request.getMeal());
        }

        Optional<AttendanceLog> logOpt = attendanceLogRepository.findByCustomerIdAndDateAndMeal(
                customer.getId(), request.getDate(), mealPlan);

        String targetAction = request.getAction();
        AttendanceLog log;

        if ("mark_present".equalsIgnoreCase(targetAction)) {
            if (logOpt.isPresent()) {
                log = logOpt.get();
                if (log.getAction() == ActionType.Skipped) {
                    customer.setSkippedCount(Math.max(0, customer.getSkippedCount() - 1));
                    customer.setMealsUsed(customer.getMealsUsed() + 1);
                } else if (log.getAction() != ActionType.Present) {
                    customer.setMealsUsed(customer.getMealsUsed() + 1);
                }
                log.setAction(ActionType.Present);
                log.setSource(SourceType.Manual);
            } else {
                log = new AttendanceLog();
                log.setDate(request.getDate());
                log.setCustomer(customer);
                log.setCustomerName(customer.getName());
                log.setMeal(mealPlan);
                log.setAction(ActionType.Present);
                log.setSource(SourceType.Manual);
                log.setMess(customer.getMess());
                customer.setMealsUsed(customer.getMealsUsed() + 1);
            }
            customerRepository.save(customer);
            AttendanceLog saved = attendanceLogRepository.save(log);
            return attendanceLogMapper.toResponse(saved);

        } else if ("mark_skipped".equalsIgnoreCase(targetAction)) {
            if (logOpt.isPresent()) {
                log = logOpt.get();
                if (log.getAction() == ActionType.Present) {
                    customer.setMealsUsed(Math.max(0, customer.getMealsUsed() - 1));
                    customer.setSkippedCount(customer.getSkippedCount() + 1);
                } else if (log.getAction() != ActionType.Skipped) {
                    customer.setSkippedCount(customer.getSkippedCount() + 1);
                }
                log.setAction(ActionType.Skipped);
                log.setSource(SourceType.Manual);
            } else {
                log = new AttendanceLog();
                log.setDate(request.getDate());
                log.setCustomer(customer);
                log.setCustomerName(customer.getName());
                log.setMeal(mealPlan);
                log.setAction(ActionType.Skipped);
                log.setSource(SourceType.Manual);
                log.setMess(customer.getMess());
                customer.setSkippedCount(customer.getSkippedCount() + 1);
            }
            customerRepository.save(customer);
            AttendanceLog saved = attendanceLogRepository.save(log);
            return attendanceLogMapper.toResponse(saved);

        } else if ("mark_absent".equalsIgnoreCase(targetAction)) {
            if (logOpt.isPresent()) {
                log = logOpt.get();
                if (log.getAction() == ActionType.Present) {
                    customer.setMealsUsed(Math.max(0, customer.getMealsUsed() - 1));
                } else if (log.getAction() == ActionType.Skipped) {
                    customer.setSkippedCount(Math.max(0, customer.getSkippedCount() - 1));
                }
                customerRepository.save(customer);
                AttendanceLogResponse response = attendanceLogMapper.toResponse(log);
                attendanceLogRepository.delete(log);
                return response;
            } else {
                AttendanceLogResponse response = new AttendanceLogResponse();
                response.setDate(request.getDate());
                response.setCustomerId(customer.getId());
                response.setCustomerName(customer.getName());
                response.setMeal(mealPlan);
                response.setAction(null);
                response.setSource(SourceType.Manual);
                return response;
            }
        } else {
            throw new BadRequestException("Invalid action: " + targetAction);
        }
    }
}
