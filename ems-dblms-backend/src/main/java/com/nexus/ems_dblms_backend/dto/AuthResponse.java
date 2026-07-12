package com.nexus.ems_dblms_backend.dto;

import com.nexus.ems_dblms_backend.model.Role;

public record AuthResponse(
        String token,
        String username,
        Role role,
        Long userId
) {
}
