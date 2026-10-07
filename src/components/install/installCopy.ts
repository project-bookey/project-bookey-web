import type { InstallReason } from './types';

/**
 * 설치 안내 문구 — 쓰기 동작이 있던 자리마다 왜 앱이 필요한지 한 줄로 말한다(해요체).
 * 제목은 그 자리의 동작, 본문은 앱에서 얻는 것.
 */
export const INSTALL_COPY: Record<InstallReason, { title: string; body: string }> = {
  generic: {
    title: '이 기능은 Bookey 앱에서 쓸 수 있어요',
    body: '앱을 설치하면 책을 서재에 담고, 독서 시간을 재고, 독후감을 쓸 수 있어요.',
  },
  compose: {
    title: '독후감은 앱에서 써요',
    body: '사진과 책 속 문장을 곁들인 독후감을 앱에서 남겨 보세요.',
  },
  like: {
    title: '좋아요는 앱에서 눌러요',
    body: '마음에 드는 독후감에 하트를 남기려면 Bookey 앱이 필요해요.',
  },
  bookLike: {
    title: '이 책에 하트를 남기려면 앱이 필요해요',
    body: '좋아하는 책을 표시해 두고 추천에 반영해요.',
  },
  read: {
    title: '이 책, 앱에서 읽기 시작해요',
    body: '서재에 담고 타이머로 독서 시간을 재요. 다 읽으면 완독 카드가 남아요.',
  },
  library: {
    title: '서재는 앱에 있어요',
    body: '읽고 싶은 책을 담아 두고 진도를 기록해요.',
  },
  review: {
    title: '리뷰는 앱에서 남겨요',
    body: '이 책을 읽은 기록이 있어야 별점과 리뷰를 남길 수 있어요.',
  },
  follow: {
    title: '팔로우는 앱에서 해요',
    body: '이 독자의 새 독후감을 앱에서 받아 보세요.',
  },
  postcard: {
    title: '엽서는 앱에서 보내요',
    body: '엽서로 마음을 전하고, 답장이 오면 채팅이 열려요.',
  },
  club: {
    title: '클럽은 앱에서 함께해요',
    body: '함께 읽을 사람들과 모임을 잡고 모임 노트를 써요.',
  },
};
