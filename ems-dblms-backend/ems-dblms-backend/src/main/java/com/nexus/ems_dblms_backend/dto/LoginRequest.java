package com.nexus.ems_dblms_backend.dto;

public record LoginRequest(
        String username,
        String password
) {
}
