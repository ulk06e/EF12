import math

def calculate_level_from_xp(total_xp):
    """Calculate level based on total XP using a square root progression."""
    return int(math.sqrt(total_xp / 100))

def calculate_next_level_xp(level):
    """Calculate XP needed for next level using quadratic progression."""
    return 100 * (level + 1) ** 2

def calculate_xp(actual_duration, estimated_duration, task_quality, time_quality, priority):
    base_xp = actual_duration / 10

    quality_map = {"A": 4, "B": 3, "C": 2, "D": 1}
    quality_multiplier = quality_map.get(task_quality, 1)

    time_quality_multiplier = 1.5 if time_quality == "pure" else 1.0

    if priority == 1:
        priority_multiplier = 1.5
    elif priority == 2:
        priority_multiplier = 1.4
    elif priority == 3:
        priority_multiplier = 1.3
    else:
        priority_multiplier = 1.0

    # Penalty for time difference
    penalty_multiplier = 1.0
    if estimated_duration and actual_duration:
        ratio = actual_duration / estimated_duration
        quality = task_quality

        if quality in ['A', 'B']:
            if 1.5 < ratio <= 2.0:
                penalty_multiplier = 0.7
            elif ratio > 2.0:
                penalty_multiplier = 0.5
            elif 0.5 <= ratio < 0.8:
                penalty_multiplier = 0.7
            elif ratio < 0.5:
                penalty_multiplier = 0.5
        
        elif quality in ['C', 'D']:
            if (1.2 < ratio <= 1.5) or (0.5 <= ratio < 0.8):
                penalty_multiplier = 0.7
            elif ratio > 1.5 or ratio < 0.5:
                penalty_multiplier = 0.5

    # Calculate final XP
    xp = base_xp * quality_multiplier * time_quality_multiplier * priority_multiplier * penalty_multiplier + 40
    return math.floor(xp)


def update_project_xp(project_id, xp_to_add, actual_duration, db):
    from models import Project  # Updated import
    
    # Get project and update XP
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return
    
    # Update XP and calculate new level
    project.current_xp += xp_to_add
    new_level = calculate_level_from_xp(project.current_xp)
    project.current_level = new_level
    project.next_level_xp = calculate_next_level_xp(new_level)
    
    # Update parent project if exists
    if project.parent_id:
        update_project_xp(project.parent_id, xp_to_add, actual_duration, db)
    
    db.commit()
    return project
