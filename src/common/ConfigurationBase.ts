const fs = require("fs");
import * as child_process from "child_process";

export enum CertOptions {
  Default,
  PEM,
  PFX,
}

export default abstract class ConfigurationBase {
  public constructor(
    public readonly host: string,
    public readonly port: number,
    public readonly enableAccessLog: boolean = false,
    public readonly accessLogWriteStream?: NodeJS.WritableStream,
    public readonly enableDebugLog: boolean = false,
    public readonly debugLogFilePath?: string,
    public readonly loose: boolean = false,
    public cert: string = "",
    public readonly key: string = "",
    public pwd: string = "",
    public readonly https: boolean = true
  ) {}

  public exportCert() {
    return new Promise((resolve, reject) => {
      this.pwd = "123456";
      this.cert = "azurite.pfx";
      const certName = "localhost";
      try {
        child_process.exec(
          `CertUtil -p ${this.pwd} -exportPFX -user ${certName} azurite.pfx`,
          (error, stdout, stderr) => {
            resolve({ stdout, stderr });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  public hasCert() {
    if (this.cert.length > 0 && this.key.length > 0) {
      return CertOptions.PEM;
    }
    if (this.cert.length > 0 && this.pwd.toString().length > 0) {
      return CertOptions.PFX;
    }
    if (this.https) {
      return this.exportCert().then(() => CertOptions.PFX);
    }

    return CertOptions.Default;
  }

  public getCert(option: any) {
    switch (option) {
      case CertOptions.PEM:
        return {
          cert: fs.readFileSync(this.cert),
          key: fs.readFileSync(this.key),
        };
      case CertOptions.PFX:
        return {
          pfx: fs.readFileSync(this.cert),
          passphrase: this.pwd.toString(),
        };
      default:
        return null;
    }
  }

  public getHttpServerAddress(): string {
    return `http${this.hasCert() == CertOptions.Default ? "" : "s"}://${
      this.host
    }:${this.port}`;
  }
}
