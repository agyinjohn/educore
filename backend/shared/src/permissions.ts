import { Role, Action, Resource } from './types/index'

type PermissionMap = Partial<Record<Role, Partial<Record<Resource, Action[]>>>>

export const PERMISSIONS: PermissionMap = {
  [Role.SUPER_ADMIN]: {
    [Resource.TENANT]: [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE, Action.APPROVE],
    [Resource.USER]:   [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
  },
  [Role.SCHOOL_OWNER]: {
    [Resource.TENANT]: [Action.VIEW, Action.EDIT],
    [Resource.USER]:   [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    [Resource.STUDENT]:[Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    [Resource.STAFF]:  [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    [Resource.REPORT]: [Action.VIEW],
  },
  [Role.SCHOOL_ADMIN]: {
    [Resource.TENANT]: [Action.VIEW, Action.EDIT],
    [Resource.USER]:   [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.STUDENT]:[Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    [Resource.STAFF]:  [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.CLASS]:  [Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    [Resource.FEE]:    [Action.VIEW, Action.CREATE, Action.EDIT, Action.APPROVE],
    [Resource.REPORT]: [Action.VIEW, Action.CREATE],
    [Resource.INVENTORY]: [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.TRANSPORT]: [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.HOSTEL]: [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.LIBRARY]:[Action.VIEW, Action.CREATE, Action.EDIT],
  },
  [Role.ACADEMIC_HEAD]: {
    [Resource.CLASS]:      [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.TIMETABLE]:  [Action.VIEW, Action.CREATE, Action.EDIT, Action.APPROVE],
    [Resource.ATTENDANCE]: [Action.VIEW, Action.APPROVE],
    [Resource.GRADE]:      [Action.VIEW, Action.EDIT, Action.APPROVE],
    [Resource.EXAM]:       [Action.VIEW, Action.CREATE, Action.EDIT, Action.APPROVE],
    [Resource.REPORT]:     [Action.VIEW, Action.CREATE],
    [Resource.STUDENT]:    [Action.VIEW],
    [Resource.STAFF]:      [Action.VIEW],
  },
  [Role.TEACHER]: {
    [Resource.CLASS]:      [Action.VIEW],
    [Resource.TIMETABLE]:  [Action.VIEW],
    [Resource.ATTENDANCE]: [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.GRADE]:      [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.EXAM]:       [Action.VIEW],
    [Resource.STUDENT]:    [Action.VIEW],
  },
  [Role.ACCOUNTANT]: {
    [Resource.FEE]:    [Action.VIEW, Action.CREATE, Action.EDIT, Action.APPROVE],
    [Resource.PAYROLL]:[Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.REPORT]: [Action.VIEW, Action.CREATE],
    [Resource.STUDENT]:[Action.VIEW],
  },
  [Role.HR_MANAGER]: {
    [Resource.STAFF]:  [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.PAYROLL]:[Action.VIEW, Action.CREATE, Action.EDIT, Action.APPROVE],
    [Resource.LEAVE]:  [Action.VIEW, Action.CREATE, Action.EDIT, Action.APPROVE],
    [Resource.REPORT]: [Action.VIEW],
  },
  [Role.LIBRARIAN]: {
    [Resource.LIBRARY]:[Action.VIEW, Action.CREATE, Action.EDIT, Action.DELETE],
    [Resource.STUDENT]:[Action.VIEW],
  },
  [Role.TRANSPORT_COORDINATOR]: {
    [Resource.TRANSPORT]:[Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.STUDENT]:  [Action.VIEW],
  },
  [Role.WARDEN]: {
    [Resource.HOSTEL]: [Action.VIEW, Action.CREATE, Action.EDIT],
    [Resource.STUDENT]:[Action.VIEW],
  },
  [Role.STUDENT]: {
    [Resource.TIMETABLE]:  [Action.VIEW],
    [Resource.ATTENDANCE]: [Action.VIEW],
    [Resource.GRADE]:      [Action.VIEW],
    [Resource.EXAM]:       [Action.VIEW],
    [Resource.LIBRARY]:    [Action.VIEW],
  },
  [Role.PARENT]: {
    [Resource.STUDENT]:    [Action.VIEW],
    [Resource.ATTENDANCE]: [Action.VIEW],
    [Resource.GRADE]:      [Action.VIEW],
    [Resource.FEE]:        [Action.VIEW],
    [Resource.TRANSPORT]:  [Action.VIEW],
  },
}

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  return PERMISSIONS[role]?.[resource]?.includes(action) ?? false
}
