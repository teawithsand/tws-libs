import { parseLegacyMapBlob } from "./map"

const mapOneArray = [
	0x31, 0x2e, 0x33, 0x00, 0xcd, 0x74, 0x69, 0x6c, 0x65, 0x73, 0x30, 0x31,
	0x2e, 0x62, 0x6d, 0x70, 0x00, 0x00, 0x66, 0x69, 0x65, 0x6c, 0x64, 0x33,
	0x5f, 0x64, 0x2e, 0x62, 0x6d, 0x70, 0x00, 0x73, 0x6f, 0x6e, 0x67, 0x30,
	0x31, 0x2e, 0x78, 0x6d, 0x20, 0x20, 0x20, 0x00, 0x74, 0x72, 0x61, 0x69,
	0x6e, 0x69, 0x6e, 0x67, 0x20, 0x63, 0x6f, 0x75, 0x72, 0x73, 0x65, 0xcc,
	0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0x00, 0xcd, 0xcd,
	0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd,
	0x6a, 0x61, 0x6e, 0x6e, 0x65, 0x20, 0x6b, 0x69, 0x76, 0x69, 0x6c, 0x61,
	0x68, 0x74, 0x69, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc,
	0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0x00, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd, 0xcd,
	0xcd, 0xcd, 0xcd, 0xcd, 0x31, 0x00, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc,
	0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x30, 0x30, 0x30,
	0x00, 0x00, 0x00, 0x00, 0x32, 0x30, 0x30, 0x30, 0x00, 0x00, 0x00, 0x00,
	0x32, 0x30, 0x30, 0x30, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x31, 0x39, 0x35, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x31, 0x38, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x32, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x72, 0x6f, 0x6f, 0x73, 0x74, 0x65, 0x72, 0x2e, 0x73, 0x70, 0x72, 0x00,
	0xcd, 0x69, 0x6e, 0x66, 0x6f, 0x33, 0x2e, 0x73, 0x70, 0x72, 0x00, 0xcd,
	0xcd, 0xcd, 0x69, 0x6e, 0x66, 0x6f, 0x31, 0x30, 0x2e, 0x73, 0x70, 0x72,
	0x00, 0xcd, 0xcd, 0x69, 0x6e, 0x66, 0x6f, 0x31, 0x34, 0x2e, 0x73, 0x70,
	0x72, 0x00, 0xcd, 0xcd, 0x61, 0x70, 0x70, 0x6c, 0x65, 0x2e, 0x73, 0x70,
	0x72, 0x00, 0x00, 0xcd, 0xcd, 0x73, 0x6d, 0x61, 0x6c, 0x6c, 0x68, 0x65,
	0x6e, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x67, 0x69, 0x66, 0x74, 0x5f, 0x66,
	0x74, 0x68, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x66, 0x65, 0x61, 0x74, 0x68,
	0x65, 0x72, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x00, 0x68, 0x65, 0x64, 0x67,
	0x65, 0x68, 0x6f, 0x67, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x69, 0x6e, 0x66,
	0x6f, 0x35, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x70, 0x72, 0x00, 0x69, 0x6e,
	0x66, 0x6f, 0x39, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x00, 0x00, 0x00, 0x6d,
	0x65, 0x67, 0x61, 0x70, 0x68, 0x6f, 0x6e, 0x2e, 0x73, 0x70, 0x72, 0x00,
	0x69, 0x6e, 0x66, 0x6f, 0x31, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x70, 0x72,
	0x00, 0x69, 0x6e, 0x66, 0x6f, 0x31, 0x32, 0x2e, 0x73, 0x70, 0x72, 0x00,
	0x72, 0x00, 0x69, 0x6e, 0x66, 0x6f, 0x31, 0x37, 0x2e, 0x73, 0x70, 0x72,
	0x00, 0x72, 0x00, 0x68, 0x65, 0x6e, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x70,
	0x72, 0x00, 0x72, 0x00, 0x62, 0x67, 0x5f, 0x62, 0x75, 0x73, 0x68, 0x2e,
	0x73, 0x70, 0x72, 0x00, 0xcd, 0x62, 0x74, 0x74, 0x72, 0x66, 0x6c, 0x79,
	0x32, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x74, 0x6c, 0x70, 0x6f, 0x72, 0x74,
	0x31, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x00, 0x67, 0x69, 0x66, 0x74, 0x5f,
	0x66, 0x6c, 0x77, 0x2e, 0x73, 0x70, 0x72, 0x00, 0x30, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x32, 0x30, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x31, 0x32, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31, 0x35, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x56, 0x56, 0x56, 0x3c, 0x3c, 0x3c, 0x3c, 0x3c, 0x56, 0x56, 0x56,
	0x56, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x56, 0x56, 0x56, 0x56,
	0x56, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0x17, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x6a, 0x6b, 0x6c, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x5d, 0x5e, 0x5e, 0x5e, 0x5f, 0xff, 0x6a, 0x6b, 0x6c, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0x17, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x56, 0x56, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x56, 0x56,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x74, 0x75, 0x76, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x6a, 0x6b,
	0x6c, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x4f, 0x4f, 0x67, 0x68, 0x68, 0x68, 0x69, 0x4f,
	0x74, 0x75, 0x76, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x6a, 0x6b, 0xff, 0x17, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x55,
	0x55, 0x55, 0x55, 0x55, 0xff, 0xff, 0x7e, 0x7f, 0x80, 0x6a, 0x6b, 0x6c,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0x74, 0x75, 0x76, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0x55, 0x57, 0x56, 0xff, 0xff, 0xff, 0xff, 0xff, 0x6a, 0x5d, 0x5e, 0x5e,
	0x5e, 0x5e, 0x5e, 0x5e, 0x5e, 0x5f, 0x7f, 0x80, 0xff, 0x6a, 0x6c, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x59, 0x57, 0xff,
	0x74, 0x75, 0x17, 0x17, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x60, 0x60,
	0xff, 0x57, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x60, 0xff, 0xff,
	0x6d, 0xff, 0x74, 0x75, 0x76, 0xff, 0xff, 0xff, 0xff, 0x59, 0xff, 0xff,
	0xff, 0xff, 0xff, 0x8f, 0x77, 0x77, 0x77, 0x77, 0x74, 0x75, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x61, 0x61, 0xff,
	0xff, 0xff, 0xff, 0x72, 0x72, 0x72, 0x72, 0x72, 0x72, 0x72, 0x73, 0x6d,
	0x77, 0x77, 0x74, 0x76, 0x77, 0x77, 0x77, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x77, 0x77, 0x59, 0x77,
	0x77, 0xff, 0x5d, 0x5e, 0x5e, 0x5e, 0x5e, 0x17, 0x17, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x3d, 0x3f, 0x40, 0x55, 0x55, 0x3d,
	0x3d, 0xff, 0xff, 0xff, 0x59, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x02, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x50, 0xff, 0xff, 0x50, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x50, 0x50, 0x50, 0x50, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0xff, 0xff, 0xff, 0xff,
	0x02, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x50,
	0x50, 0xff, 0xff, 0x50, 0x50, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0x50, 0x50, 0x50, 0x50, 0x50, 0x50, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x00, 0xff, 0xff, 0x02, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0x50, 0x50, 0x50, 0xff, 0xff, 0x50, 0x50, 0x50, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x50, 0x50, 0x50,
	0x50, 0x50, 0x50, 0x50, 0x50, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x02, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x50, 0x50, 0x53, 0xff,
	0xff, 0x52, 0x52, 0x52, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x50, 0x50, 0x53, 0x52, 0x52, 0x52, 0x52, 0x52, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x50, 0x50, 0x54, 0xff, 0xff, 0x51, 0x51, 0x51, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x50, 0x50, 0x54, 0x51, 0x51,
	0x51, 0x51, 0x51, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x86, 0x86, 0x86, 0x87, 0x87, 0x84,
	0x84, 0x84, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0x86, 0x86, 0x86, 0x84, 0x84, 0x84, 0x84, 0x84, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x86,
	0x86, 0x86, 0x87, 0x87, 0x84, 0x84, 0x84, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0x86, 0x86, 0x86, 0x84, 0x84, 0x84, 0x84,
	0x84, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x30, 0x36, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x31, 0x32, 0x36, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x31, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0x0c, 0x0a, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0a, 0x0b,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0b, 0x0a, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x56, 0x56,
	0x56, 0x56, 0xff, 0xff, 0xff, 0x0a, 0x0c, 0x3c, 0x3c, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x0a, 0x0b, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x01, 0x28, 0x38, 0x38, 0x01, 0x38, 0x01, 0x01, 0x01, 0x01,
	0x01, 0x01, 0x01, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0c,
	0x0a, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0b, 0x0a, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x94, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0xff, 0x00,
	0x02, 0x00, 0x02, 0x19, 0x02, 0x00, 0x02, 0x18, 0x02, 0x19, 0x02, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0a, 0x0b, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0x0a, 0x0b, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x28, 0x28, 0x28, 0x28, 0x28, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x18, 0x28, 0x81, 0x81, 0x02, 0x1a, 0x18, 0x1a,
	0x02, 0x1a, 0x02, 0x1a, 0x16, 0x1a, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56,
	0x2c, 0x0a, 0x0c, 0x0b, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x0b, 0x0c,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x6a, 0x6b, 0x00,
	0xff, 0x81, 0x81, 0x00, 0x18, 0x00, 0x02, 0x19, 0x02, 0x1a, 0x02, 0x00,
	0x02, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
	0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x8f, 0x56, 0x55, 0xff, 0xff, 0xff, 0xff, 0x55,
	0x55, 0x28, 0x28, 0x28, 0x28, 0x28, 0x28, 0x28, 0x28, 0x28, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0x95, 0x74, 0x75, 0xff, 0x28, 0x02, 0x1a, 0x19, 0x1a,
	0x16, 0x1a, 0x18, 0x1a, 0x1a, 0x17, 0x18, 0x1a, 0x1a, 0x02, 0x1a, 0x18,
	0x1a, 0x02, 0x1a, 0x1a, 0x02, 0x1a, 0x18, 0x1a, 0x02, 0x1a, 0x18, 0x1a,
	0x02, 0x1a, 0x18, 0x1a, 0xff, 0x57, 0x23, 0x56, 0x56, 0x23, 0x1f, 0x20,
	0x1f, 0x22, 0x1f, 0x23, 0x56, 0x56, 0x6a, 0x6b, 0x6b, 0x6c, 0x57, 0x55,
	0x56, 0x56, 0x55, 0x56, 0x55, 0x0d, 0x0e, 0x0e, 0x0f, 0x55, 0x56, 0x56,
	0x56, 0x56, 0x57, 0x0d, 0x0e, 0x0e, 0x0f, 0x8f, 0xff, 0x8f, 0x36, 0x01,
	0x38, 0x38, 0x37, 0x55, 0x55, 0x36, 0x01, 0x38, 0x01, 0x37, 0x55, 0x55,
	0x23, 0x55, 0x55, 0x55, 0x55, 0x55, 0x56, 0x56, 0x23, 0x56, 0x56, 0x56,
	0x56, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x56, 0x60, 0x60, 0x56, 0x60, 0x60, 0x28, 0x28, 0x28, 0x28,
	0x28, 0xff, 0xff, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00,
	0x02, 0x00, 0x02, 0x02, 0x00, 0x18, 0x00, 0x02, 0x19, 0x02, 0x02, 0x00,
	0x18, 0x00, 0x02, 0x00, 0x18, 0x00, 0x02, 0x00, 0x18, 0x00, 0x02, 0x01,
	0x01, 0x38, 0x01, 0x01, 0x01, 0x38, 0x01, 0x01, 0x38, 0x38, 0x01, 0x01,
	0x01, 0x38, 0x38, 0x38, 0x01, 0x01, 0x38, 0x38, 0x01, 0x01, 0x01, 0x38,
	0x01, 0x01, 0x01, 0x01, 0x38, 0x38, 0x15, 0x15, 0x38, 0x01, 0x38, 0x38,
	0x01, 0x38, 0x01, 0x38, 0x01, 0x00, 0x00, 0x00, 0x19, 0x00, 0x01, 0x38,
	0x00, 0x00, 0x19, 0x00, 0x00, 0x01, 0x01, 0x38, 0x01, 0x38, 0x01, 0x01,
	0x38, 0x38, 0x01, 0x38, 0x01, 0x38, 0x01, 0x01, 0x37, 0xff, 0xff, 0xff,
	0x2e, 0x2c, 0xff, 0xff, 0xff, 0x93, 0xff, 0xff, 0x36, 0x01, 0x38, 0x38,
	0x01, 0x01, 0x38, 0x38, 0x01, 0x38, 0x01, 0x01, 0x18, 0x1a, 0x18, 0x1a,
	0x1a, 0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x19,
	0x1a, 0x16, 0x1a, 0x18, 0x1a, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x19, 0x1a,
	0x16, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x19, 0x02, 0x00, 0x02, 0x18, 0x02, 0x19, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x00, 0x02, 0x19, 0x02, 0x00, 0x02, 0x18, 0x02, 0x19, 0x02, 0x00, 0x02,
	0x00, 0xff, 0xff, 0x02, 0x19, 0x02, 0x00, 0x02, 0x18, 0x02, 0x19, 0x02,
	0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x19, 0x02, 0x00, 0x02, 0x18, 0x02,
	0x19, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x19, 0x02, 0x00, 0x02,
	0x18, 0x02, 0x19, 0x02, 0x6c, 0x56, 0x56, 0x2e, 0x2c, 0x55, 0x56, 0x0d,
	0x0e, 0x0f, 0x57, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x19, 0x02, 0x00,
	0x02, 0x18, 0x02, 0x00, 0x02, 0x16, 0x02, 0x00, 0x19, 0x00, 0x02, 0x19,
	0x17, 0x19, 0x02, 0x00, 0x02, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00,
	0x02, 0x18, 0x19, 0x18, 0x1a, 0x02, 0x1a, 0x18, 0x1a, 0x02, 0x1a, 0x02,
	0x1a, 0x16, 0x1a, 0x18, 0x19, 0x18, 0x1a, 0x02, 0x3a, 0x01, 0x01, 0x01,
	0x01, 0x01, 0x1a, 0x16, 0x1a, 0x18, 0x19, 0x14, 0xff, 0xff, 0x14, 0x18,
	0x1a, 0x02, 0x1a, 0x01, 0x1a, 0x01, 0x1a, 0x18, 0x19, 0x18, 0x1a, 0x18,
	0x19, 0x14, 0x14, 0x14, 0x14, 0x18, 0x1a, 0x16, 0x1a, 0x18, 0x19, 0x18,
	0x1a, 0x02, 0x1a, 0x18, 0x1a, 0x02, 0x1a, 0x02, 0x1a, 0x16, 0x1a, 0x01,
	0x01, 0x38, 0x38, 0x01, 0x01, 0x38, 0x01, 0x01, 0x38, 0x01, 0x18, 0x19,
	0x18, 0x1a, 0x02, 0x01, 0x01, 0x01, 0x01, 0x1a, 0x02, 0x1a, 0x18, 0x1a,
	0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a,
	0x1a, 0x1a, 0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x1a, 0x1a, 0x1a, 0x02, 0x1a,
	0x1a, 0x1a, 0x02, 0x1a, 0x1a, 0x1a, 0x02, 0x1a, 0x00, 0x02, 0x16, 0x02,
	0x00, 0x18, 0x01, 0x02, 0x01, 0x01, 0x01, 0x01, 0x01, 0x35, 0x00, 0x02,
	0x16, 0x02, 0x32, 0x18, 0x00, 0x02, 0x19, 0x02, 0x1a, 0x02, 0x00, 0x02,
	0x00, 0x04, 0xff, 0xff, 0xff, 0xff, 0x03, 0x02, 0x19, 0x02, 0x1a, 0x02,
	0x00, 0x02, 0x00, 0x02, 0x16, 0x02, 0x00, 0x04, 0xff, 0xff, 0xff, 0xff,
	0x03, 0x02, 0x00, 0x02, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x02,
	0x19, 0x02, 0x1a, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x19, 0x02, 0x00, 0x02, 0x18, 0x00, 0x02, 0x16, 0x02, 0x00, 0x18, 0x00,
	0x02, 0x01, 0x01, 0x1a, 0x01, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x19,
	0x02, 0x00, 0x02, 0x18, 0x02, 0x19, 0x02, 0x02, 0x00, 0x19, 0x00, 0x02,
	0x19, 0x17, 0x02, 0x00, 0x19, 0x00, 0x02, 0x00, 0x19, 0x00, 0x02, 0x00,
	0x19, 0x00, 0x02, 0x19, 0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x18,
	0x1a, 0x1a, 0x17, 0x18, 0x1a, 0x33, 0x1a, 0x02, 0x32, 0x19, 0x1a, 0x16,
	0x1a, 0x18, 0x1a, 0x1a, 0x17, 0x01, 0x01, 0x04, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x03, 0x18, 0x1a, 0x1a, 0x17, 0x18, 0x1a, 0x01, 0x01, 0x02,
	0x1a, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x03, 0x01, 0x1a, 0x19,
	0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x16, 0x01, 0x01, 0x01, 0x1a, 0x17, 0x18,
	0x1a, 0x18, 0x19, 0x18, 0x01, 0x01, 0x01, 0x18, 0x1a, 0x02, 0x1a, 0x02,
	0x01, 0x01, 0x02, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x18, 0x1a, 0x1a, 0x17,
	0x18, 0x19, 0x18, 0x1a, 0x02, 0x1a, 0x18, 0x1a, 0x02, 0x1a, 0x02, 0x1a,
	0x16, 0x1a, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x18, 0x1a,
	0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x00, 0x02,
	0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x00, 0x33, 0x32, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x00, 0x02, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x02,
	0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x00, 0x02, 0x00, 0x01, 0x01, 0x02, 0x00, 0x02, 0x00, 0x02, 0x16, 0x02,
	0x00, 0x18, 0x00, 0x01, 0x01, 0x01, 0x1a, 0x00, 0x02, 0x00, 0x02, 0x00,
	0x01, 0x01, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x01, 0x16, 0x02, 0x00,
	0x18, 0x00, 0x02, 0x19, 0x02, 0x1a, 0x02, 0x00, 0x02, 0x02, 0x00, 0x02,
	0x19, 0x02, 0x00, 0x02, 0x02, 0x00, 0x02, 0x19, 0x02, 0x00, 0x02, 0x19,
	0x02, 0x00, 0x02, 0x19, 0x02, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x1a, 0x02,
	0x1a, 0x19, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x33, 0x1a, 0x1a,
	0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0x19, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18,
	0x1a, 0x18, 0x1a, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x18,
	0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x18,
	0x1a, 0x18, 0x1a, 0x19, 0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x18,
	0x1a, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x1a, 0x02, 0x1a, 0x19, 0x1a,
	0x18, 0x1a, 0x19, 0x1a, 0x02, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x18, 0x1a,
	0x1a, 0x17, 0x18, 0x1a, 0x1a, 0x02, 0x1a, 0x18, 0x1a, 0x02, 0x1a, 0x1a,
	0x02, 0x1a, 0x18, 0x1a, 0x02, 0x1a, 0x18, 0x1a, 0x02, 0x1a, 0x18, 0x1a,
	0x00, 0x02, 0x16, 0x02, 0x00, 0x19, 0x00, 0x02, 0x19, 0x17, 0x19, 0x02,
	0x00, 0x02, 0x00, 0x02, 0x16, 0x02, 0x00, 0x19, 0x00, 0x02, 0x19, 0x17,
	0x19, 0x02, 0x00, 0x02, 0x82, 0x82, 0x82, 0x82, 0x82, 0x82, 0x82, 0x82,
	0x19, 0x17, 0x19, 0x02, 0x00, 0x02, 0x00, 0x02, 0x16, 0x02, 0x82, 0x82,
	0x82, 0x82, 0x82, 0x82, 0x82, 0x82, 0x00, 0x02, 0x00, 0x02, 0x16, 0x02,
	0x00, 0x19, 0x00, 0x02, 0x19, 0x17, 0x19, 0x02, 0x00, 0x02, 0x00, 0x02,
	0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x00, 0x02, 0x16,
	0x02, 0x00, 0x19, 0x00, 0x02, 0x19, 0x17, 0x19, 0x02, 0x00, 0x02, 0x00,
	0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x02,
	0x00, 0x18, 0x00, 0x02, 0x19, 0x02, 0x02, 0x00, 0x18, 0x00, 0x02, 0x00,
	0x18, 0x00, 0x02, 0x00, 0x18, 0x00, 0x02, 0x18, 0x1a, 0x18, 0x1a, 0x18,
	0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18,
	0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x18, 0x1a, 0x18, 0x1a, 0x18,
	0x1a, 0x18, 0x1a, 0x18, 0x1a, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18,
	0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x1a, 0x02,
	0x1a, 0x19, 0x1a, 0x18, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a,
	0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x1a, 0x02, 0x1a,
	0x19, 0x1a, 0x18, 0x1a, 0x18, 0x1a, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x18,
	0x1a, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x19, 0x1a, 0x16, 0x1a, 0x19, 0x1a,
	0x16, 0x1a, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x30,
	0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31, 0x31, 0x33, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x39, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x10,
	0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0x04, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0x04, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x04, 0x04, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x04, 0x13, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x0b, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0x04, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0x04, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x04, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0x04,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0x04, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0x12, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0x08, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0x07, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x0c, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x11,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x12, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0x01, 0xff, 0xff, 0x04, 0x04, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x02, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x04, 0x04, 0x04, 0x04,
	0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x10, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0x0f, 0x0e, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0x08, 0x04, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x08, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0f, 0x0d, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0x10, 0xff, 0xff, 0xff, 0xff, 0x06, 0x0a, 0xff,
	0x09, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
]

const mapOne = new Uint8Array([...mapOneArray]).buffer

describe("legacy map parser", () => {
	it("parses map one", () => {
		expect(parseLegacyMapBlob(mapOne)).toEqual({})
	})
})
