package com.messmanagement.service.impl;

import com.messmanagement.dto.request.LoginRequest;
import com.messmanagement.dto.request.RegisterRequest;
import com.messmanagement.dto.response.JwtResponse;
import com.messmanagement.entity.Mess;
import com.messmanagement.entity.MessSettings;
import com.messmanagement.entity.User;
import com.messmanagement.repository.MessRepository;
import com.messmanagement.repository.MessSettingsRepository;
import com.messmanagement.repository.UserRepository;
import com.messmanagement.security.JwtTokenProvider;
import com.messmanagement.exception.BadRequestException;
import com.messmanagement.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {
    
    @org.springframework.beans.factory.annotation.Value("${app.registration-passcode:super-secret-registration-code-change-me}")
    private String requiredRegistrationPasscode;
    
    private final UserRepository userRepository;
    private final MessRepository messRepository;
    private final MessSettingsRepository messSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    
    @Override
    @Transactional(readOnly = true)
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UUID messId = (user.getMess() != null) ? user.getMess().getId() : null;
        
        return new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles(),
                messId
        );
    }
    
    @Override
    public JwtResponse register(RegisterRequest request) {
        if (request.getRegistrationPasscode() == null || !request.getRegistrationPasscode().equals(requiredRegistrationPasscode)) {
            throw new BadRequestException("Invalid registration passcode");
        }
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }
        
        // 1. Create and save Mess
        Mess mess = new Mess();
        mess.setName(request.getMessName());
        mess.setLocation(request.getLocation());
        mess.setAddress(request.getAddress());
        mess = messRepository.save(mess);
        
        // 2. Create and save default settings
        MessSettings settings = new MessSettings();
        settings.setMess(mess);
        settings.setLunchCutoffTime(java.time.LocalTime.of(12, 0));
        settings.setDinnerCutoffTime(java.time.LocalTime.of(20, 0));
        settings.setAutoMarkEnabled(true);
        settings.setTimezone("Asia/Kolkata");
        messSettingsRepository.save(settings);
        
        // 3. Create and save User owner
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of("ROLE_ADMIN"));
        user.setMess(mess);
        userRepository.save(user);
        
        // 4. Log in immediately
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(request.getUsername());
        loginRequest.setPassword(request.getPassword());
        return login(loginRequest);
    }
}
