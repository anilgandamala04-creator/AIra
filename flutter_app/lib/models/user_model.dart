class User {
  final String id;
  final String email;
  final String name;
  final String? displayName;
  final String? avatar;
  final AuthMethod authMethod;
  final bool isVerified;
  final DateTime createdAt;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.displayName,
    this.avatar,
    required this.authMethod,
    this.isVerified = false,
    required this.createdAt,
  });

  factory User.createGuest() {
    return User(
      id: 'guest_${DateTime.now().millisecondsSinceEpoch}',
      email: 'guest@aitutor.demo',
      name: 'Guest User',
      displayName: 'Guest',
      authMethod: AuthMethod.guest,
      isVerified: false,
      createdAt: DateTime.now(),
    );
  }

  factory User.createDemo() {
    return User(
      id: 'demo_user_123',
      email: 'demo@aitutor.app',
      name: 'Demo User',
      displayName: 'Demo',
      authMethod: AuthMethod.email,
      isVerified: true,
      createdAt: DateTime.now(),
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      displayName: json['displayName'] as String?,
      avatar: json['avatar'] as String?,
      authMethod: AuthMethod.fromString(json['authMethod'] as String),
      isVerified: json['isVerified'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'displayName': displayName,
      'avatar': avatar,
      'authMethod': authMethod.toString(),
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? displayName,
    String? avatar,
    AuthMethod? authMethod,
    bool? isVerified,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      displayName: displayName ?? this.displayName,
      avatar: avatar ?? this.avatar,
      authMethod: authMethod ?? this.authMethod,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

enum AuthMethod {
  google,
  apple,
  email,
  guest;

  static AuthMethod fromString(String value) {
    switch (value) {
      case 'google':
        return AuthMethod.google;
      case 'apple':
        return AuthMethod.apple;
      case 'email':
        return AuthMethod.email;
      case 'guest':
        return AuthMethod.guest;
      default:
        return AuthMethod.email;
    }
  }

  @override
  String toString() {
    switch (this) {
      case AuthMethod.google:
        return 'google';
      case AuthMethod.apple:
        return 'apple';
      case AuthMethod.email:
        return 'email';
      case AuthMethod.guest:
        return 'guest';
    }
  }
}
