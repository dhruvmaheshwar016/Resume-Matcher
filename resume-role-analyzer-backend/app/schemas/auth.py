from pydantic import BaseModel, EmailStr


# ── Request schemas ──────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


# ── Response schemas ─────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
