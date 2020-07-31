import { Exception } from "@kaviar/core";

export class UserNotFoundException extends Exception {
  getMessage() {
    return "User not found";
  }
}

export class UserNotAuthorizedException extends Exception {
  getMessage() {
    return "User not authorized";
  }
}

export class UserDisabledException extends Exception {
  getMessage() {
    return "User is disabled";
  }
}

export class SessionExpiredException extends Exception {
  getMessage() {
    return "Session has expired";
  }
}
