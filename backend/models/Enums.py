from enum import Enum

class Roles(Enum):
    UNAUTHORIZED = -1
    ADMIN = 0
    VOLUNTEER = 1
    VETS = 2
    CAREGIVER = 3

class Status(Enum):
    PENDING = 0
    APPROVED = 1
    REJECTED = 2
    SCHEDULED = 3
    COMPLETED = 4