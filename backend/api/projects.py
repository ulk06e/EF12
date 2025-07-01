from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from models import Project
from db import get_db
import datetime

router = APIRouter(prefix="/projects")

@router.get("")
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).filter(Project.completed == False).all()

@router.post("")
def create_project(project: dict, db: Session = Depends(get_db)):
    new_project = Project(**project)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.put("/{project_id}")
def update_project(project_id: str, project: dict = Body(...), db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        return {"error": "Project not found"}, 404
    
    # Update project fields
    for key, value in project.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    def delete_project_and_descendants(project_id):
        # Get all children of the current project
        children = db.query(Project).filter(Project.parent_id == project_id).all()
        # Recursively delete all children and their descendants
        for child in children:
            delete_project_and_descendants(child.id)
        # Delete the current project
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            db.delete(project)
    try:
        # Start the recursive deletion
        delete_project_and_descendants(project_id)
        db.commit()
        return {"message": "Project and all descendants deleted successfully"}
    except Exception as e:
        db.rollback()
        raise e
