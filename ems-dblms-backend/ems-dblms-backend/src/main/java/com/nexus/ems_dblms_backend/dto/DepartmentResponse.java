package com.nexus.ems_dblms_backend.dto;

import java.math.BigDecimal;

public record DepartmentResponse(
        Long id,
        String name,
        Long managerId,
        String managerName,
        BigDecimal maxBudget,
        BigDecimal remainingBudget
) {
}
