import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/text';

export default function NotFound() {
  return (
    <div className="content-narrow pt-10">
      <EmptyState
        title="찾는 글이 없어요"
        description="주소가 잘못됐거나 글쓴이가 지웠어요."
        action={
          <ButtonLink href="/" variant="tonal">
            홈으로
          </ButtonLink>
        }
      />
    </div>
  );
}
