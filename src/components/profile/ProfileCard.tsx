import { AlertTriangleIcon, EyeOffIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { strings } from "@/lib/strings";

export interface ProfileCardProps {
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  searchOptOut: boolean;
  /** `PageHeader`와 같은 패턴 — 4상태(D-030 ③)를 이 컴포넌트 하나가 직접 표현한다. */
  status?: "default" | "loading" | "empty" | "error";
  errorMessage?: string;
}

/**
 * 계정 설정 화면(SC-19, FR-004) 상단 프로필 요약 카드. 순수 표현 컴포넌트 — `lib/data`를
 * import하지 않는다(D-030 ①), `AccountSettingsContainer`가 조회한 값을 props로만 받는다.
 *
 * `empty` 상태는 `OnboardingFormContainer`가 이미 문서화한 엣지 케이스와 같다 — 세션은 있는데
 * `profileId`가 가리키는 프로필 레코드가 없는 Mock 경쟁 조건. `error`는 조회 자체가 실패한
 * 경우(네트워크류)다. 이 두 실패 모드를 갈라 둔 이유는 문구가 다르기 때문이다("정보가 아예
 * 없다" vs "불러오지 못했다, 다시 시도해볼 만하다").
 */
export function ProfileCard({
  handle,
  displayName,
  bio,
  avatarUrl,
  searchOptOut,
  status = "default",
  errorMessage,
}: ProfileCardProps) {
  if (status === "loading") {
    return (
      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full max-w-64" />
        </CardContent>
      </Card>
    );
  }

  if (status === "empty" || status === "error") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            {status === "empty"
              ? strings.account.settings.errors.notFound
              : (errorMessage ?? strings.account.settings.errors.loadFailed)}
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <Avatar size="lg">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground">{displayName}</span>
          <span className="truncate text-sm text-muted-foreground">@{handle}</span>
        </div>
        {searchOptOut && (
          <Badge variant="outline" className="ml-auto gap-1">
            <EyeOffIcon aria-hidden="true" />
            {strings.account.settings.fields.searchOptOut}
          </Badge>
        )}
      </CardHeader>
      {bio && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{bio}</p>
        </CardContent>
      )}
    </Card>
  );
}
