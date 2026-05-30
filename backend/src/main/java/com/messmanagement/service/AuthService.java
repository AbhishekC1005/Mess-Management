package com.messmanagement.service;

import com.messmanagement.dto.request.LoginRequest;
import com.messmanagement.dto.request.RegisterRequest;
import com.messmanagement.dto.response.JwtResponse;

public interface AuthService {
    JwtResponse login(LoginRequest request);
    JwtResponse register(RegisterRequest request);
}
