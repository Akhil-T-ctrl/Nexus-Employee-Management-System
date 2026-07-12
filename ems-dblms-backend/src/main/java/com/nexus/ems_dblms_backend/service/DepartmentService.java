package com.nexus.ems_dblms_backend.service;

import com.nexus.ems_dblms_backend.dto.DepartmentRequest;
import com.nexus.ems_dblms_backend.dto.DepartmentResponse;
import com.nexus.ems_dblms_backend.exception.ResourceNotFoundException;
import com.nexus.ems_dblms_backend.mapper.DepartmentMapper;
import com.nexus.ems_dblms_backend.model.Department;
import com.nexus.ems_dblms_backend.model.Role;
import com.nexus.ems_dblms_backend.model.User;
import com.nexus.ems_dblms_backend.repository.DepartmentRepository;
import com.nexus.ems_dblms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final UserRepository userRepository;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest requestDTO){
        Department department = new Department();
        department.setName(requestDTO.name());
        department.setMaxBudget(requestDTO.maxBudget());

        department.setRemainingBudget(requestDTO.maxBudget());

        if(requestDTO.managerId() == null){
            throw new IllegalArgumentException("A department must be assigned a manager upon creation.");
        }

        User manager = userRepository.findById(requestDTO.managerId())
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + requestDTO.managerId()));

        if (manager.getRole() != Role.ROLE_MANAGER) {
            throw new IllegalArgumentException("The assigned user must have the MANAGER role.");
        }

        department.setManager(manager);

        Department savedDepartment = departmentRepository.save(department);
        return departmentMapper.toResponseDTO(savedDepartment);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(departmentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments(Long managerId){
        return departmentRepository.findByManagerId(managerId)
                .stream()
                .map(departmentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public String deleteDepartmentByAdmin(Long departmentId){
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("no such department exists"));

        departmentRepository.delete(department);
        return("department is deleted succesfully and employees under it are automatically deleted");
    }
}
