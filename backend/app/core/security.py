import logging
import httpx
from typing import Optional, List, Dict, Any
from jose import jwt, JWTError, jwk
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.schemas.auth import TokenData


security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)

# Cache for JWKS keys to avoid repeated network calls
_jwks_cache: Dict[str, Any] = None


async def get_jwks() -> List[Dict[str, Any]]:
    """
    Fetch the JWKS (JSON Web Key Set) from Supabase.
    """
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache.get("keys", [])

    jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            _jwks_cache = response.json()
            return _jwks_cache.get("keys", [])
    except Exception as e:
        logger.error(f"Failed to fetch JWKS from {jwks_url}: {str(e)}")
        return []


async def verify_supabase_token(token: str) -> TokenData:
    """
    Verify the JWT token from Supabase based on its algorithm (HS256 or ES256).
    """
    try:
        # 1. Unverified header to determine algorithm and key ID
        header = jwt.get_unverified_header(token)
        alg = header.get("alg")
        kid = header.get("kid")

        if alg == "ES256":
            # ECDSA P-256 requires the public key from JWKS
            keys = await get_jwks()
            key_data = next((k for k in keys if k["kid"] == kid), None)
            if not key_data:
                # Fallback: try to find any ES256 key if kid doesn't match
                key_data = next((k for k in keys if k["alg"] == "ES256"), None)

            if not key_data:
                raise JWTError("No matching public key found in JWKS for ES256")

            # Verify with the public key
            payload = jwt.decode(
                token,
                key_data,
                algorithms=["ES256"],
                options={"verify_aud": False},
            )
        else:
            # Default to HS256 with the symmetric secret
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )

        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role", "user")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing sub",
            )

        return TokenData(user_id=str(user_id), email=email, role=role)

    except Exception as e:
        logger.error(f"JWT Verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> TokenData:
    """
    FastAPI dependency to secure routes.
    """
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Missing or invalid token",
        )
    return await verify_supabase_token(auth.credentials)
