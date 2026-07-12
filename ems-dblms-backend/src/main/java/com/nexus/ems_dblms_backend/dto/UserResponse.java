package com.nexus.ems_dblms_backend.dto;

import java.util.List;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String designation,
        String role,
        Long departmentId,
        String departmentName
) {
}
