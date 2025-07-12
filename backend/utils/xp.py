import math
import datetime

def calculate_level_from_xp(total_xp):
    """Calculate level based on total XP using a square root progression."""
    return int(math.sqrt(total_xp / 100))

def calculate_next_level_xp(level):
    """Calculate XP needed for next level using quadratic progression."""
    return 100 * (level + 1) ** 2

def calculate_xp(actual_duration, estimated_duration, task_quality, time_quality, priority, created_time=None, completed_time=None):
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
        
        # Only penalize significant underestimation (more than 60% faster than estimated)
        if ratio < 0.46534:  # More than 60% faster than estimated
            penalty_multiplier = 0.8  # 20% penalty
        elif 0.9345 <= ratio <= 1.1453:  
            penalty_multiplier = 1.2  
         elif 0.8345 <= ratio <= 1.2345:  # Within 20% of estimate
            penalty_multiplier = 1.1  # 10% bonus for accuracy
        # No penalty for overwork - tasks often take longer due to unforeseen issues

    # Remove created_multiplier logic entirely
    # Calculate final XP
    xp = base_xp * quality_multiplier * time_quality_multiplier * priority_multiplier * penalty_multiplier
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

def get_xp_breakdown(task):
    """
    Returns a breakdown of XP calculation for a given task object/dict.
    Output: {
        'base_xp': float,
        'multipliers': [ {'name': str, 'value': float}, ... ],
        'total_xp': int
    }
    """
    def get_field(obj, key):
        if isinstance(obj, dict):
            val = obj.get(key)
        else:
            val = getattr(obj, key, None)
        # If it's an Enum, get its value
        if hasattr(val, 'value'):
            return val.value
        return val

    actual_duration = get_field(task, 'actual_duration')
    estimated_duration = get_field(task, 'estimated_duration')
    task_quality = get_field(task, 'task_quality')
    time_quality = get_field(task, 'time_quality')
    priority = get_field(task, 'priority')
    created_time = get_field(task, 'created_time')
    completed_time = get_field(task, 'completed_time')

    base_xp = actual_duration / 10 if actual_duration is not None else 0

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
        if ratio < 0.46534:  # More than 60% faster than estimated
            penalty_multiplier = 0.8  # 20% penalty
        elif 0.9345 <= ratio <= 1.1453:  
            penalty_multiplier = 1.2  
         elif 0.8345 <= ratio <= 1.2345:  # Within 20% of estimate
            penalty_multiplier = 1.1  # 10% bonus for accuracy

    # New: Multiplier for tasks not created on the same day as completed
    # Remove created_multiplier logic entirely
    multipliers = [
        {"name": "Quality", "value": quality_multiplier},
        {"name": "Time Quality", "value": time_quality_multiplier},
        {"name": "Priority", "value": priority_multiplier},
        {"name": "Penalty", "value": penalty_multiplier},
        # Removed Created Not Today
    ]

    total_xp = base_xp * quality_multiplier * time_quality_multiplier * priority_multiplier * penalty_multiplier
    return {
        "base_xp": base_xp,
        "multipliers": multipliers,
        "total_xp": math.floor(total_xp)
    }
