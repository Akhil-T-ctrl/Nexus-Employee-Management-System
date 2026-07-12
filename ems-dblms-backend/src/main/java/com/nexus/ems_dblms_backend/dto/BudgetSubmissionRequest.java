package com.nexus.ems_dblms_backend.dto;

import java.math.BigDecimal;

public record BudgetSubmissionRequest(
        String title,
        String description,
        BigDecimal amount,
        Long departmentId
) {
}
