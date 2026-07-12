package com.nexus.ems_dblms_backend.dto;

import java.math.BigDecimal;

public record DepartmentRequest(
        String name,
        Long managerId,
        BigDecimal maxBudget
) {
}
