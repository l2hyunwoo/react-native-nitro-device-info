# 패키지 릴리스

[English](RELEASING.md) | **한국어**

공개 패키지 3개를 배포하는 관리자를 위한 문서입니다. changeset 작성 방법은 [기여 안내](../CONTRIBUTING-ko.md#npm-배포)를 참고하세요.

## 배포 설정

- 저장소 설정에서 GitHub Actions의 PR 생성을 허용합니다. [Release workflow](workflows/release.yml)가 Changesets로 버전 PR을 관리합니다.
- GitHub의 `npm` environment와 필요한 승인자를 설정합니다.
- 이미 배포된 각 npm 패키지에 [trusted publisher](https://docs.npmjs.com/trusted-publishers/)를 설정합니다. owner는 `l2hyunwoo`, repository는 `react-native-nitro-device-info`, workflow는 `release.yml`, environment는 `npm`입니다. 이 workflow가 사용하는 직접 `npm publish`를 허용하고 npm 설정의 만료 기간 안에 publisher를 활성화합니다.
- GitHub-hosted runner에서 Node 22.14 이상과 npm 11.5.1 이상을 사용합니다. publish job은 `id-token: write` 권한으로 OIDC 인증을 사용하며 장기 `NPM_TOKEN`은 사용하지 않습니다.
- 한 번도 배포하지 않은 패키지는 publisher 설정에 앞서 [최초 배포 절차](#integrity-최초-배포)를 거쳐야 합니다.

## 배포 없이 OIDC 검증

`main`에서 **Release**를 `publish: false`, `verify_oidc: true`로 실행합니다.

```sh
gh workflow run release.yml --ref main -f publish=false -f verify_oidc=true
```

선택한 커밋을 검토한 뒤 `npm` environment를 승인합니다. 이 모드는 GitHub OIDC 토큰을 요청하고 공개 패키지 3개의 npm 인증 토큰으로 교환합니다. 저장소, workflow, 브랜치, environment, 토큰 종류와 만료 시간을 검사합니다. 토큰 값은 마스킹하며 파일에 저장하지 않습니다. job 요약에는 패키지 이름, HTTP 결과, 만료 시간만 기록합니다.

이 모드에서는 릴리스 빌드와 배포를 건너뜁니다. 패키지 버전, dist-tag, Git 태그, GitHub Release를 변경하지 않습니다. 두 입력을 모두 `true`로 지정하면 검증에 실패하며 publish job은 실행되지 않습니다.

토큰 교환에 성공해도 npm이 요구하는 최초 배포를 대신하지는 않습니다. 새 trusted publisher는 등록 후 2일 안에 첫 배포를 완료해야 합니다. [설정 만료 정책](https://docs.npmjs.com/trusted-publishers/#trusted-publisher-configuration-expiry)을 참고하세요.

## 릴리스 순서

1. 영향을 받는 패키지의 changeset과 변경을 병합합니다. `main` push 시 **chore(release): version packages** PR을 만들거나 갱신합니다. push 이벤트로 npm에 배포하지는 않습니다.
2. 버전 PR의 패키지 버전, changelog, lockfile, 검증 결과를 검토한 뒤 병합합니다.
3. `main`에서 **Release**를 기본값인 `publish: false`로 수동 실행합니다. 선택한 커밋의 전체 CI 결과, 레지스트리 비교 결과, 검증된 tarball artifact를 확인합니다.
4. 배포가 승인되면 같은 커밋에서 `publish: true`로 **Release**를 수동 실행합니다. 이 실행은 사용할 archive를 직접 빌드하고 검사합니다. `npm` environment 승인이 필요하면 해당 실행의 검증 결과와 artifact를 검토한 뒤 승인합니다.
5. npm 버전과 패키지별 태그·GitHub Release를 확인합니다.

전체 CI를 마친 뒤 npm에 해당 버전이 없는 패키지를 빌드하고 패킹합니다. 실제 workspace를 패킹하며 lifecycle script는 실행하지 않습니다. 메타데이터, 진입점, 네이티브 바인딩, Expo plugin, MCP 데이터를 검사한 뒤 SHA-512 해시와 함께 archive를 업로드합니다. publish job은 다운로드한 파일을 다시 검사하고 같은 archive를 npm provenance와 함께 배포합니다.

배포에는 `main`, 적용을 마친 changeset, 변경사항 없는 checkout에서 만든 artifact가 필요합니다. npm에서 같은 archive를 확인한 뒤 태그와 GitHub Release를 만듭니다. scope가 있는 MCP를 포함해 태그는 `<package-name>@<version>` 형식입니다. 기존 태그는 유지합니다. 릴리스 동시 실행 제어는 진행 중인 실행을 취소하지 않습니다.

## 일부 배포 후 실패한 경우

원래 workflow 실행의 **Re-run failed jobs**를 사용하세요. 원래 커밋과 archive를 유지합니다. 레지스트리의 archive 해시가 일치하는지 확인한 뒤 누락된 태그나 GitHub Release를 만들며 이미 배포된 정확한 버전은 다시 배포하지 않습니다.

이미 배포한 버전의 릴리스 정보를 복구하려고 workflow를 새로 실행하지 마세요. 새로운 릴리스 계획은 이미 배포된 정확한 버전을 건너뜁니다. 레지스트리 조회에 실패하면 실행을 중단합니다.

## Integrity 최초 배포

integrity 최초 배포는 manifest의 `0.1.0`을 사용합니다. 최초 배포 전 수정에는 추가 버전 변경이 필요하지 않습니다. 배포 후에는 다른 패키지와 같은 changeset 기준을 따릅니다.

이 배포를 승인하기 전에 지원하는 실기기의 attestation과 백엔드의 토큰 검증을 확인하세요. 빌드, 플랫폼 대역, 시뮬레이터 테스트로는 이 결과를 확인할 수 없습니다.

1. 위 버전 PR과 릴리스 검증을 마칩니다. 배포가 승인되면 `main`에서 **Release**를 `publish: true`로 실행합니다. trusted publisher가 없어 publish job이 integrity에서 실패할 때까지 기다린 뒤 해당 실행의 검증된 integrity archive를 보존합니다.
2. 인증된 npm 관리자가 검토한 integrity archive를 한 번 배포합니다.

   ```sh
   npm publish <checked-integrity-tarball.tgz> --access public --ignore-scripts
   ```

3. 패키지의 trusted publisher를 설정합니다.
4. 같은 `publish: true` 실행의 **Re-run failed jobs**를 사용해 레지스트리의 archive 해시를 확인하고 릴리스 정보를 완성합니다.

integrity만 beta로 배포하려고 모노레포 전체에 적용되는 `changeset pre enter`를 사용하지 마세요.

## 배포 없이 로컬 검증

workspace 의존성을 설치하고 Node 22.14 이상과 npm 11.5.1 이상을 사용하세요. 레포지터리 루트에서 실행합니다.

```sh
yarn release:prepare
yarn release:verify
```

이 명령은 공개 레지스트리를 읽고 git에서 제외한 `.release/`에 archive를 만듭니다. npm 배포, 태그 생성, GitHub Release 생성은 하지 않습니다. 커밋하지 않은 변경사항이 있으면 배포할 수 없는 초안 artifact를 만듭니다. `release:publish`는 수동 Actions publish job에서만 실행할 수 있습니다.
