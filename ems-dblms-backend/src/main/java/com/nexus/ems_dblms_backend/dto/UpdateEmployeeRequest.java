package com.nexus.ems_dblms_backend.dto;

public record UpdateEmployeeRequest(
        String username,
        String password,
        String fullName
) {
}
