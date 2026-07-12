package com.nexus.ems_dblms_backend.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        BigDecimal amount,
        String status,
        Long employeeId,
        String employeeName,
        Long departmentId,
        String departmentName,
        String description,
        String title
) {
}
