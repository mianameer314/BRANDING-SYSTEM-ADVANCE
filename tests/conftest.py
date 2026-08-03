import os
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from passlib.context import CryptContext

from app.main import app
from app.db.session import Base
from app.api.deps import get_db, get_current_user, get_refresh_user
from app.services.storage.service import StorageService, get_storage_service
from app.models.user import User

# In-memory SQLite Database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create tables in the testing database
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


class MockStorageService:
    def upload_image(self, file, subfolder):
        return f"http://testserver/media/{subfolder}/mock_image.webp"

    def upload_images(self, files, subfolder):
        return [self.upload_image(f, subfolder) for f in files if f.filename]

    def upload_file(self, file, subfolder):
        return f"http://testserver/media/{subfolder}/mock_file.pdf", file.filename or "mock_file.pdf"

    def delete_file(self, url):
        pass

    def delete_files(self, urls):
        pass

    def replace_image(self, old_url, new_file, subfolder):
        return self.upload_image(new_file, subfolder)

    def replace_file(self, old_url, new_file, subfolder):
        return self.upload_file(new_file, subfolder)

    def rollback_uploads(self):
        pass

    def clear_pending(self):
        pass

mock_storage_service = MockStorageService()

def override_get_storage_service():
    return mock_storage_service


# We need a user to bypass auth
@pytest.fixture(scope="session")
def admin_user():
    from datetime import datetime, timezone
    return User(
        id=1,
        email="superadmin@example.com",
        full_name="Super Admin",
        hashed_password="fakehash",
        is_active=True,
        role="super_admin",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


@pytest.fixture(scope="session")
def normal_user():
    from datetime import datetime, timezone
    return User(
        id=2,
        email="user@example.com",
        full_name="Normal User",
        hashed_password="fakehash",
        is_active=True,
        role="user",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

# Override the dependency for FastAPI
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_storage_service] = lambda: mock_storage_service

# Patch the function for direct calls
import unittest.mock
patcher = unittest.mock.patch("app.api.v1.resources.get_storage_service", return_value=mock_storage_service)
patcher.start()
patcher2 = unittest.mock.patch("app.api.v1.blogs.get_storage_service", return_value=mock_storage_service)
patcher2.start()
patcher3 = unittest.mock.patch("app.api.v1.projects.get_storage_service", return_value=mock_storage_service)
patcher3.start()
patcher4 = unittest.mock.patch("app.api.v1.news.get_storage_service", return_value=mock_storage_service)
patcher4.start()
patcher5 = unittest.mock.patch("app.api.v1.insights.get_storage_service", return_value=mock_storage_service)
patcher5.start()
patcher6 = unittest.mock.patch("app.api.v1.case_studies.get_storage_service", return_value=mock_storage_service)
patcher6.start()

@pytest.fixture(scope="module")
def client(admin_user, cleanup_db):
    # Default dependency override uses admin user
    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_refresh_user] = lambda: admin_user
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def normal_client(normal_user):
    app.dependency_overrides[get_current_user] = lambda: normal_user
    app.dependency_overrides[get_refresh_user] = lambda: normal_user
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def db_session():
    # Provide a session fixture for tests that need to manually manipulate DB
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Provide a fixture that creates tables fresh for a module if needed.
@pytest.fixture(scope="module", autouse=True)
def cleanup_db(db_session, admin_user, normal_user):
    # This runs before each test module.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Insert test users so that Foreign Key constraints pass
    admin_dict = {k: v for k, v in admin_user.__dict__.items() if not k.startswith('_')}
    normal_dict = {k: v for k, v in normal_user.__dict__.items() if not k.startswith('_')}
    db_session.add(User(**admin_dict))
    db_session.add(User(**normal_dict))
    db_session.commit()
    
    yield
