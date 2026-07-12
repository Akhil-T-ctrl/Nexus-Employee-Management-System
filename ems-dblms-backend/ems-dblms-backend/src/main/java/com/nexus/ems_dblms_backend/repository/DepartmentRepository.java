package com.nexus.ems_dblms_backend.repository;

import com.nexus.ems_dblms_backend.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department,Long> {
    List<Department> findByManagerId(Long managerId);
}
