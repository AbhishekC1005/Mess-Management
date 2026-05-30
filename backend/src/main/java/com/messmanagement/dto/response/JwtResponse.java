package com.messmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private UUID id;
    private String username;
    private String email;
    private Set<String> roles;
    private UUID messId;
    
    public JwtResponse(String token, UUID id, String username, String email, Set<String> roles, UUID messId) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.messId = messId;
    }
}
