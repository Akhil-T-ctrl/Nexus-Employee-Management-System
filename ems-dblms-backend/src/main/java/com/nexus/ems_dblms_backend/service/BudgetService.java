package com.nexus.ems_dblms_backend.service;

import com.nexus.ems_dblms_backend.dto.BudgetSubmissionRequest;
import com.nexus.ems_dblms_backend.model.BudgetRequest;
import com.nexus.ems_dblms_backend.model.BudgetStatus;
import com.nexus.ems_dblms_backend.model.Department;
import com.nexus.ems_dblms_backend.model.User;
import com.nexus.ems_dblms_backend.repository.BudgetRequestRepository;
import com.nexus.ems_dblms_backend.repository.DepartmentRepository;
import com.nexus.ems_dblms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRequestRepository budgetRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public BudgetRequest createRequest(BudgetSubmissionRequest request, Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        BudgetRequest budgetRequest = BudgetRequest.builder()
                .title(request.title())
                .description(request.description())
                .amount(request.amount())
                .status(BudgetStatus.PENDING)
                .employee(employee)
                .department(department)
                .build();

        return budgetRepository.save(budgetRequest);
    }

    public List<BudgetRequest> getEmployeeRequests(Long employeeId) {
        return budgetRepository.findByEmployeeId(employeeId);
    }

    public List<BudgetRequest> getDepartmentRequests(Long departmentId) {
        return budgetRepository.findByDepartmentId(departmentId);
    }

    public BudgetRequest updateStatus(Long requestId, BudgetStatus newStatus) {
        BudgetRequest request = budgetRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Budget request not found"));

        if (request.getStatus() != BudgetStatus.PENDING) {
            throw new IllegalArgumentException("This request has already been processed.");
        }

        Department department = request.getDepartment();

        if (newStatus == BudgetStatus.APPROVED){
            BigDecimal requestAmount = request.getAmount();
            BigDecimal availableBudget = department.getRemainingBudget();

            if (requestAmount.compareTo(availableBudget) > 0) {
                throw new IllegalArgumentException("Approval denied: Request amount exceeds the department's remaining budget limit.");
            }

            department.setRemainingBudget(availableBudget.subtract(requestAmount));
            departmentRepository.save(department);

            request.setStatus(BudgetStatus.APPROVED);

        }else if (newStatus == BudgetStatus.REJECTED) {
            request.setStatus(BudgetStatus.REJECTED);
        }else{
            throw new IllegalArgumentException("Invalid operation: Cannot transition a request back to a PENDING status.");
        }

        return budgetRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<BudgetRequest> getRequestsByDeptAndStatus(Long departmentId, BudgetStatus status) {
        return budgetRepository.findByDepartmentIdAndStatus(departmentId, status);
    }


}
