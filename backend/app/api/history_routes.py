from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ..database import get_history, delete_history_item, clear_all_history, get_dashboard_statistics

router = APIRouter(prefix="/api", tags=["History & Dashboard"])

@router.get("/history")
def get_user_history(
    limit: int = Query(50, ge=1, le=200),
    problem_type: Optional[str] = Query(None, description="solve or error_check")
):
    history = get_history(limit=limit, problem_type=problem_type)
    return {"history": history}

@router.delete("/history/{item_id}")
def delete_single_history(item_id: int):
    delete_history_item(item_id)
    return {"success": True, "message": f"History item {item_id} deleted."}

@router.delete("/history")
def clear_history():
    clear_all_history()
    return {"success": True, "message": "All history and records cleared."}

@router.get("/dashboard/stats")
def get_dashboard_stats():
    stats = get_dashboard_statistics()
    return stats
