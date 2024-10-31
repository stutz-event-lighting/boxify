{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-parts.url = "github:hercules-ci/flake-parts";
  inputs.process-compose.url = "github:Platonic-Systems/process-compose-flake";
  inputs.services-flake.url = "github:juspay/services-flake";
  inputs.mongodb.url = "github:VanCoding/nix-mongodb-bin";

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
      ];
      imports = [
        inputs.process-compose.flakeModule
      ];
      perSystem =
        {
          config,
          pkgs,
          lib,
          system,
          ...
        }:
        with pkgs;
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            config.allowUnfree = true;
          };
          devShells.default = mkShell {
            buildInputs = [
              nixfmt-rfc-style
              nodejs_20
            ];
          };
          process-compose.process-compose = {
            imports = [ inputs.services-flake.processComposeModules.default ];
            cli.options.log-file = "./data/log";
            services.mongodb.mongodb.enable = true;
            services.mongodb.mongodb.package = inputs.mongodb.packages.${system}."4-4";
          };
        };
    };
}
