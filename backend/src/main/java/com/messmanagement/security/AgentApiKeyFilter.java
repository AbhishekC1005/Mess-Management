package com.messmanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

@Component
public class AgentApiKeyFilter extends OncePerRequestFilter {
    
    @Value("${agent.api-key:default-agent-key-change-me}")
    private String agentApiKey;
    
    private static final String API_KEY_HEADER = "X-Agent-Key";
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        if (path.startsWith("/api/agent/")) {
            String apiKey = request.getHeader(API_KEY_HEADER);
            
            if (apiKey == null || !apiKey.equals(agentApiKey)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Invalid or missing agent API key\"}");
                return;
            }
            
            // Set a simple authentication token for the agent
            Authentication auth = new AgentAuthenticationToken(apiKey);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private static class AgentAuthenticationToken implements Authentication {
        private final String apiKey;
        private boolean authenticated = true;
        
        AgentAuthenticationToken(String apiKey) {
            this.apiKey = apiKey;
        }
        
        @Override
        public String getName() { return "agent"; }
        @Override
        public Object getPrincipal() { return "agent"; }
        @Override
        public Object getCredentials() { return apiKey; }
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() { 
            return AuthorityUtils.createAuthorityList("ROLE_AGENT"); 
        }
        @Override
        public boolean isAuthenticated() { return authenticated; }
        @Override
        public void setAuthenticated(boolean authenticated) { this.authenticated = authenticated; }
        @Override
        public Object getDetails() { return null; }
    }
}
