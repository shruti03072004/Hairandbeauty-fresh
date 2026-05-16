package com.salon.backend.dto;

public class JwtResponse {
    private String token;
    public JwtResponse(String token){
        this.token = token;
    }
    // ✅ THIS IS REQUIRED
    public String getToken() {
        return token;
    }
}
