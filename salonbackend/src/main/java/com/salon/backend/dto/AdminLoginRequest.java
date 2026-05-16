package com.salon.backend.dto;

public class AdminLoginRequest {
    private String username;
    private String password;
    // ✅ REQUIRED
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // ✅ REQUIRED
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
