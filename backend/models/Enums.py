from enum import Enum

class Roles(Enum):
    UNAUTHORIZED = -1
    ADMIN = 0
    USER = 1
    VETS = 2
    CAREGIVER = 3