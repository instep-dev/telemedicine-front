export type LoginDto = {
  email: string;
  password: string;
};

export type DoctorDto = {
  id: string;
  email: string;
  name?: string;
};

export type LoginResponseDto = {
  accessToken: string;
  doctor: DoctorDto;
};

export type RefreshResponseDto = {
  accessToken: string;
  doctor?: DoctorDto;
};
