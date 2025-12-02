import AsyncStorage from "@react-native-async-storage/async-storage";

const API_DELAY = 800;

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  isAdmin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ReconstructionJob {
  id: string;
  userId: string;
  status: "queued" | "processing" | "completed" | "failed";
  photoIds: string[];
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
  modelUrl: string | null;
  progress: number;
  errorMessage: string | null;
}

export interface Order {
  id: string;
  userId: string;
  reconstructionJobId: string;
  status: "pending" | "confirmed" | "manufacturing" | "shipped" | "delivered" | "cancelled";
  earPieceType: "standard" | "premium" | "medical";
  quantity: number;
  price: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  createdAt: number;
  updatedAt: number;
  trackingNumber: string | null;
  estimatedDelivery: number | null;
}

export interface UploadedPhoto {
  id: string;
  userId: string;
  uri: string;
  uploadedAt: number;
  side: "left" | "right";
}

const STORAGE_KEYS = {
  USERS: "@fitmyear_users",
  CURRENT_USER: "@fitmyear_current_user",
  TOKEN: "@fitmyear_token",
  JOBS: "@fitmyear_jobs",
  ORDERS: "@fitmyear_orders",
  PHOTOS: "@fitmyear_uploaded_photos",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const AuthAPI = {
  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    await delay(API_DELAY);

    const users = await this.getAllUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const user: User = {
      id: generateId(),
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      createdAt: Date.now(),
      isAdmin: email.toLowerCase().includes("admin"),
    };

    users.push(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    const passwords = JSON.parse(await AsyncStorage.getItem("@fitmyear_passwords") || "{}");
    passwords[user.id] = password;
    await AsyncStorage.setItem("@fitmyear_passwords", JSON.stringify(passwords));

    const token = `token_${generateId()}`;
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return { user, token };
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    await delay(API_DELAY);

    const users = await this.getAllUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error("No account found with this email");
    }

    const passwords = JSON.parse(await AsyncStorage.getItem("@fitmyear_passwords") || "{}");
    if (passwords[user.id] !== password) {
      throw new Error("Incorrect password");
    }

    const token = `token_${generateId()}`;
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return { user, token };
  },

  async signOut(): Promise<void> {
    await delay(300);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  async getCurrentUser(): Promise<User | null> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  async getAllUsers(): Promise<User[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : [];
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(API_DELAY);
    
    const users = await this.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    
    if (index === -1) {
      throw new Error("User not found");
    }

    users[index] = { ...users[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[index]));

    return users[index];
  },
};

export const PhotoAPI = {
  async uploadPhotos(userId: string, photos: { uri: string; side: "left" | "right" }[]): Promise<UploadedPhoto[]> {
    await delay(API_DELAY * 2);

    const existing = await this.getUserPhotos(userId);
    const newPhotos: UploadedPhoto[] = photos.map((p) => ({
      id: generateId(),
      userId,
      uri: p.uri,
      uploadedAt: Date.now(),
      side: p.side,
    }));

    const all = [...existing, ...newPhotos];
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(all));

    return newPhotos;
  },

  async getUserPhotos(userId: string): Promise<UploadedPhoto[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS);
    const all: UploadedPhoto[] = stored ? JSON.parse(stored) : [];
    return all.filter((p) => p.userId === userId);
  },

  async deletePhoto(photoId: string): Promise<void> {
    await delay(API_DELAY);
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS);
    const all: UploadedPhoto[] = stored ? JSON.parse(stored) : [];
    const filtered = all.filter((p) => p.id !== photoId);
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(filtered));
  },

  async getAllPhotos(): Promise<UploadedPhoto[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS);
    return stored ? JSON.parse(stored) : [];
  },
};

export const ReconstructionAPI = {
  async createJob(userId: string, photoIds: string[]): Promise<ReconstructionJob> {
    await delay(API_DELAY);

    const job: ReconstructionJob = {
      id: generateId(),
      userId,
      status: "queued",
      photoIds,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      modelUrl: null,
      progress: 0,
      errorMessage: null,
    };

    const jobs = await this.getAllJobs();
    jobs.push(job);
    await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));

    this.simulateProcessing(job.id);

    return job;
  },

  async simulateProcessing(jobId: string): Promise<void> {
    await delay(2000);
    await this.updateJob(jobId, { status: "processing", startedAt: Date.now(), progress: 10 });

    for (let progress = 20; progress <= 90; progress += 10) {
      await delay(1500);
      await this.updateJob(jobId, { progress });
    }

    await delay(2000);
    await this.updateJob(jobId, {
      status: "completed",
      completedAt: Date.now(),
      progress: 100,
      modelUrl: `model_${jobId}.glb`,
    });
  },

  async updateJob(jobId: string, updates: Partial<ReconstructionJob>): Promise<ReconstructionJob> {
    const jobs = await this.getAllJobs();
    const index = jobs.findIndex((j) => j.id === jobId);
    
    if (index === -1) {
      throw new Error("Job not found");
    }

    jobs[index] = { ...jobs[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));

    return jobs[index];
  },

  async getJob(jobId: string): Promise<ReconstructionJob | null> {
    const jobs = await this.getAllJobs();
    return jobs.find((j) => j.id === jobId) || null;
  },

  async getUserJobs(userId: string): Promise<ReconstructionJob[]> {
    const jobs = await this.getAllJobs();
    return jobs.filter((j) => j.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async getAllJobs(): Promise<ReconstructionJob[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.JOBS);
    return stored ? JSON.parse(stored) : [];
  },

  async getLatestUserJob(userId: string): Promise<ReconstructionJob | null> {
    const jobs = await this.getUserJobs(userId);
    return jobs[0] || null;
  },
};

export const OrderAPI = {
  async createOrder(
    userId: string,
    reconstructionJobId: string,
    earPieceType: Order["earPieceType"],
    quantity: number
  ): Promise<Order> {
    await delay(API_DELAY);

    const prices = {
      standard: 49.99,
      premium: 99.99,
      medical: 199.99,
    };

    const order: Order = {
      id: `ORD-${generateId().toUpperCase().slice(0, 8)}`,
      userId,
      reconstructionJobId,
      status: "pending",
      earPieceType,
      quantity,
      price: prices[earPieceType] * quantity,
      shippingAddress: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trackingNumber: null,
      estimatedDelivery: null,
    };

    const orders = await this.getAllOrders();
    orders.push(order);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    return order;
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    await delay(API_DELAY);

    const orders = await this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    
    if (index === -1) {
      throw new Error("Order not found");
    }

    orders[index] = { ...orders[index], ...updates, updatedAt: Date.now() };
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    return orders[index];
  },

  async getOrder(orderId: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find((o) => o.id === orderId) || null;
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = await this.getAllOrders();
    return orders.filter((o) => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async getAllOrders(): Promise<Order[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  },

  async confirmOrder(orderId: string, shippingAddress: Order["shippingAddress"]): Promise<Order> {
    return this.updateOrder(orderId, {
      status: "confirmed",
      shippingAddress,
      estimatedDelivery: Date.now() + 14 * 24 * 60 * 60 * 1000,
    });
  },

  async cancelOrder(orderId: string): Promise<Order> {
    return this.updateOrder(orderId, { status: "cancelled" });
  },

  async shipOrder(orderId: string, trackingNumber: string): Promise<Order> {
    return this.updateOrder(orderId, {
      status: "shipped",
      trackingNumber,
    });
  },
};

const OTP_STORAGE_KEY = "@fitmyear_otps";

export interface OTPVerifyResult {
  success: boolean;
  message: string;
}

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean }> => {
  await delay(API_DELAY);
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const otps = JSON.parse(await AsyncStorage.getItem(OTP_STORAGE_KEY) || "{}");
  otps[phoneNumber] = {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  await AsyncStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
  
  console.log(`OTP for ${phoneNumber}: ${otp}`);
  
  return { success: true };
};

export const verifyOTP = async (phoneNumber: string, code: string): Promise<OTPVerifyResult> => {
  await delay(API_DELAY);
  
  const otps = JSON.parse(await AsyncStorage.getItem(OTP_STORAGE_KEY) || "{}");
  const stored = otps[phoneNumber];
  
  if (!stored) {
    return { success: false, message: "No OTP found for this number" };
  }
  
  if (Date.now() > stored.expiresAt) {
    delete otps[phoneNumber];
    await AsyncStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
    return { success: false, message: "OTP has expired" };
  }
  
  if (stored.code !== code) {
    return { success: false, message: "Invalid OTP code" };
  }
  
  delete otps[phoneNumber];
  await AsyncStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
  
  return { success: true, message: "OTP verified successfully" };
};

export const AdminAPI = {
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalJobs: number;
    totalOrders: number;
    pendingJobs: number;
    pendingOrders: number;
    revenue: number;
  }> {
    await delay(API_DELAY);

    const users = await AuthAPI.getAllUsers();
    const jobs = await ReconstructionAPI.getAllJobs();
    const orders = await OrderAPI.getAllOrders();

    return {
      totalUsers: users.length,
      totalJobs: jobs.length,
      totalOrders: orders.length,
      pendingJobs: jobs.filter((j) => j.status === "queued" || j.status === "processing").length,
      pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "confirmed").length,
      revenue: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.price, 0),
    };
  },

  async getRecentActivity(): Promise<
    Array<{
      id: string;
      type: "job" | "order" | "user";
      description: string;
      timestamp: number;
    }>
  > {
    await delay(API_DELAY);

    const jobs = await ReconstructionAPI.getAllJobs();
    const orders = await OrderAPI.getAllOrders();
    const users = await AuthAPI.getAllUsers();

    const activities = [
      ...jobs.map((j) => ({
        id: j.id,
        type: "job" as const,
        description: `Reconstruction job ${j.status}`,
        timestamp: j.completedAt || j.startedAt || j.createdAt,
      })),
      ...orders.map((o) => ({
        id: o.id,
        type: "order" as const,
        description: `Order ${o.id} - ${o.status}`,
        timestamp: o.updatedAt,
      })),
      ...users.map((u) => ({
        id: u.id,
        type: "user" as const,
        description: `User ${u.name} registered`,
        timestamp: u.createdAt,
      })),
    ];

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  },
};
