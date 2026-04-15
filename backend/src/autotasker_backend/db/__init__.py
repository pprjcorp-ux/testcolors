"""Supabase data-access layer.

The repository pattern here keeps Supabase-specific calls in one place
so that the LangGraph nodes never import the Supabase SDK directly.
"""

from .client import get_supabase_admin
from .repositories import AgentRepository, ExecutionLogRepository

__all__ = ["AgentRepository", "ExecutionLogRepository", "get_supabase_admin"]
