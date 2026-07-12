package com.nexus.ems_dblms_backend.repository;

import com.nexus.ems_dblms_backend.model.BudgetRequest;
import com.nexus.ems_dblms_backend.model.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRequestRepository extends JpaRepository<BudgetRequest,Long> {
    List<BudgetRequest> findByEmployeeId(Long employeeId);
    List<BudgetRequest> findByDepartmentId(Long departmentId);
    List<BudgetRequest> findByDepartmentIdAndStatus(Long departmentId, BudgetStatus status);
}

