// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ILDSDesignSystem",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
    ],
    products: [
        .library(name: "ILDSDesignSystem", targets: ["ILDSDesignSystem"]),
    ],
    targets: [
        .target(
            name: "ILDSTokens",
            path: "Sources/ILDSTokens"
        ),
        .target(
            name: "ILDSDesignSystem",
            dependencies: ["ILDSTokens"],
            path: "Sources/ILDSDesignSystem"
        ),
    ]
)
