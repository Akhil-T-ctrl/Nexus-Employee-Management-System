package com.nexus.ems_dblms_backend.dto;

import com.nexus.ems_dblms_backend.model.Role;

public record RegisterRequest(
        String username,
        String password,
        Role role,
        Long departmentId,
        String fullName,
        String designation
) {
}
