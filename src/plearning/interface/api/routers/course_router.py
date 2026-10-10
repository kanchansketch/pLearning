"""
Course Router – /create_courses, /view_courses, /view_modules,
/view_lessons, /view_assignments
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from plearning.application.dtos.course_dtos import (
    CreateAssignmentDTO,
    CreateCourseDTO,
    CreateLessonDTO,
    CreateModuleDTO,
    UpdateCourseDTO,
)
from plearning.application.services.course_service import CourseService
from plearning.domain.exceptions import DomainException
from plearning.interface.api.dependencies import get_course_service
from plearning.interface.schemas.course_schemas import (
    AssignmentResponse,
    CourseResponse,
    CreateCourseRequest,
    LessonResponse,
    ModuleResponse,
    UpdateCourseRequest,
)

router = APIRouter(tags=["Courses"])


@router.post(
    "/create_courses",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course with modules, lessons, and assignments",
)
async def create_course(
    body: CreateCourseRequest,
    service: CourseService = Depends(get_course_service),
) -> CourseResponse:
    try:
        dto = CreateCourseDTO(
            title=body.title,
            description=body.description,
            teacher_id=body.teacher_id,
            modules=[
                CreateModuleDTO(
                    title=m.title,
                    description=m.description,
                    lessons=[
                        CreateLessonDTO(
                            title=ls.title,
                            description=ls.description,
                            content=ls.content,
                            content_url=ls.content_url,
                            assignments=[
                                CreateAssignmentDTO(
                                    title=a.title,
                                    description=a.description,
                                    questions=list(a.questions),
                                )
                                for a in ls.assignments
                            ],
                        )
                        for ls in m.lessons
                    ],
                )
                for m in body.modules
            ],
        )
        result = await service.create_course(dto)
        return CourseResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/view_courses",
    response_model=List[CourseResponse],
    summary="View all courses",
)
async def view_courses(
    teacher_id: str | None = None,
    service: CourseService = Depends(get_course_service),
) -> List[CourseResponse]:
    try:
        if teacher_id:
            results = await service.get_teacher_courses(teacher_id)
        else:
            results = await service.get_all_courses()
        return [CourseResponse.model_validate(r) for r in results]
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get(
    "/view_courses/{course_id}",
    response_model=CourseResponse,
    summary="View a single course",
)
async def view_course(
    course_id: str,
    service: CourseService = Depends(get_course_service),
) -> CourseResponse:
    try:
        result = await service.get_course(course_id)
        return CourseResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.put(
    "/view_courses/{course_id}",
    response_model=CourseResponse,
    summary="Update a course",
)
async def update_course(
    course_id: str,
    body: UpdateCourseRequest,
    service: CourseService = Depends(get_course_service),
) -> CourseResponse:
    try:
        dto = UpdateCourseDTO(title=body.title, description=body.description)
        result = await service.update_course(course_id, dto)
        return CourseResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/view_modules/{course_id}",
    response_model=List[ModuleResponse],
    summary="View modules for a course",
)
async def view_modules(
    course_id: str,
    service: CourseService = Depends(get_course_service),
) -> List[ModuleResponse]:
    try:
        results = await service.get_modules(course_id)
        return [ModuleResponse.model_validate(r) for r in results]
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get(
    "/view_lessons/{course_id}/{module_id}",
    response_model=List[LessonResponse],
    summary="View lessons for a module",
)
async def view_lessons(
    course_id: str,
    module_id: str,
    service: CourseService = Depends(get_course_service),
) -> List[LessonResponse]:
    try:
        results = await service.get_lessons(course_id, module_id)
        return [LessonResponse.model_validate(r) for r in results]
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get(
    "/view_assignments/{course_id}/{module_id}/{lesson_id}",
    response_model=List[AssignmentResponse],
    summary="View assignments for a lesson",
)
async def view_assignments(
    course_id: str,
    module_id: str,
    lesson_id: str,
    service: CourseService = Depends(get_course_service),
) -> List[AssignmentResponse]:
    try:
        results = await service.get_assignments(course_id, module_id, lesson_id)
        return [AssignmentResponse.model_validate(r) for r in results]
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
