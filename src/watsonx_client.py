"""
watsonx_client.py — shared watsonx.ai connection helper for OutageIQ.

Provides get_model() which returns a ready-to-use ModelInference instance
configured with credentials from the environment (.env or system env vars).
Both risk_engine.py and app.py import from here.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

WATSONX_URL = "https://eu-de.ml.cloud.ibm.com"
MODEL_ID = "ibm/granite-4-h-small"


def get_model():
    """
    Return a ModelInference instance using WATSONX_API_KEY and
    WATSONX_PROJECT_ID from the environment.

    Raises ValueError if either credential is missing.
    Raises ImportError if ibm-watsonx-ai is not installed.
    """
    api_key = os.getenv("WATSONX_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")

    if not api_key or not project_id:
        raise ValueError(
            "WATSONX_API_KEY and WATSONX_PROJECT_ID must be set in the environment."
        )

    from ibm_watsonx_ai import Credentials
    from ibm_watsonx_ai.foundation_models import ModelInference

    credentials = Credentials(url=WATSONX_URL, api_key=api_key)
    return ModelInference(
        model_id=MODEL_ID,
        credentials=credentials,
        project_id=project_id,
    )
