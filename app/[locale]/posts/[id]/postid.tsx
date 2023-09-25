'use client';

import LoadPage from '@/app/[locale]/load/load';
import ErrorPage from '@/app/[locale]/error/error';
// import { clientQueryPostDetails, postView } from '@/services/api';
import { toRelativeTime } from '@/lib/tool';
import type {
  IPostClientDetails,
  IPostComment,
  IQueryParams,
} from '@/interfaces';
import { useCallback, useEffect, useRef, useState } from 'react';
import useUser from '@/hooks/useUser';
import type { TBody, TMetadata } from '@/types';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import useToast from '@/hooks/useToast';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import Content from '@/app/[locale]/posts/[id]/content';
import Comment from '@/app/[locale]/posts/[id]/comment';
import PostComment from '@/app/[locale]/posts/[id]/postComment';
import PostName from '@/app/[locale]/common/post/name';


export default function PostIdPage({ metadata }: { metadata: TMetadata }) {
    const viewRef = useRef(false);
  
    const postViewMutation = useMutation(async (variables: TBody<void>) => {
    //   await postView(variables);
    });
  
    const postViewCallback = useCallback(() => {
      const id = metadata.all['postId'].k[3];
    //   if (!viewRef.current) {
    //     viewRef.current = true;
    //     postViewMutation.mutateAsync({
    //       id,
    //     });
    //   }
    }, [metadata.all, postViewMutation]);
  
    useEffect(() => {
      postViewCallback();
    }, [postViewCallback]);
  
    return (
      <>
        <NavbarPage metadata={metadata} />
        <PostId metadata={metadata} />
        <FooterPage metadata={metadata} />
      </>
    );
}

const PostId = ({ metadata }: { metadata: TMetadata }) => {
    const userQuery = useUser(metadata);
    const { show } = useToast();
    const [pages, setPages] = useState<IPostComment[]>(
      (metadata.all['postId'].v as IPostClientDetails).data.content,
    );
    const [isClickLoadMore, setIsClickLoadMore] = useState(false);
  
    const clientQueryPostDetailsQuery = useInfiniteQuery(
      metadata.all['postId'].k,
      async (context) => {
        return (await clientQueryPostDetails({
          id: context.queryKey[3],
          query: {
            ...(context.queryKey[5] as IQueryParams),
            ...context.pageParam,
          },
        })) as IPostClientDetails;
      },
      {
        enabled: isClickLoadMore,
        keepPreviousData: true,
        getPreviousPageParam: (firstPage) => {
          if (firstPage.data.pageable.previous) {
            return {
              page: Math.max(firstPage.data.pageable.page - 1, 0),
              size: firstPage.data.pageable.size,
            };
          }
        },
        getNextPageParam: (lastPage) => {
          if (lastPage.data.pageable.next) {
            return {
              page: Math.min(
                lastPage.data.pageable.page + 1,
                lastPage.data.pageable.pages,
              ),
              size: lastPage.data.pageable.size,
            };
          }
        },
        initialData: () => {
          return {
            pages: [metadata.all['postId'].v as IPostClientDetails],
            pageParams: [
              {
                page: Math.max(
                  ((metadata.all['postId'].k[5] as IQueryParams).page ?? 1) - 1,
                  0,
                ),
                size: (metadata.all['postId'].k[5] as IQueryParams).size,
              },
            ],
          };
        },
      },
    );
  
    useEffect(() => {
      if (clientQueryPostDetailsQuery.data) {
        setPages(
          clientQueryPostDetailsQuery.data.pages
            .flatMap((item) => {
              item.basic._contentUpdatedOnText = toRelativeTime(
                item.basic.contentUpdatedOn,
              );
              return item.data.content;
            })
            .map((item) => {
              item.comment._createdOnText = toRelativeTime(
                item.comment.createdOn,
              );
              return item;
            }),
        );
      }
    }, [clientQueryPostDetailsQuery.data]);
  
    async function onClickLoadMore() {
      setIsClickLoadMore(true);
      try {
        await clientQueryPostDetailsQuery.fetchNextPage();
      } catch (e) {
        show({
          type: 'DANGER',
          message: e,
        });
      }
    }
  
    if (clientQueryPostDetailsQuery.data) {
      const postData = clientQueryPostDetailsQuery.data.pages[0];
      const style = (postData.basic.styles || []).find(
        (value) => value.type === 'NAME',
      );
  
      return (
        <div className="col px-0">
          <div className="card border-0">
            <div className="card-body p-2 overflow-hidden">
              <PostName
                item={postData.basic}
                isEdit={
                  userQuery.data &&
                  userQuery.data.user &&
                  userQuery.data.user.id === postData.basic.createdBy
                }
                isJustifyContentCenter
                boxClassName="h4 mb-0 py-5"
                textDecorationNone
                isPostReviewHistory
              />
  
              <Content postData={postData} metadata={metadata} />
  
              {pages.map((item, index) => {
                return (
                  <Comment
                    key={item.comment.id}
                    commentItem={item}
                    commentIndex={index}
                    postData={postData}
                    metadata={metadata}
                  />
                );
              })}
  
              {clientQueryPostDetailsQuery.hasNextPage && (
                <div className="row overflow-hidden">
                  <div className="col-12 col-lg-2 pe-0"></div>
                  <div className="col-auto border-1 px-0 border-secondary border-opacity-10 border-end"></div>
                  <div className="col col-lg-9 flex-grow-1 ps-0">
                    <div className="row mt-4 mx-1 mb-5">
                      <div className="col rounded">
                        <button
                          onClick={onClickLoadMore}
                          disabled={
                            !clientQueryPostDetailsQuery.hasNextPage ||
                            clientQueryPostDetailsQuery.isFetchingNextPage
                          }
                          type="button"
                          className="btn btn-light w-100 text-secondary"
                        >
                          {clientQueryPostDetailsQuery.isFetchingNextPage ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Loading...
                            </>
                          ) : (
                            <i className="bi bi-three-dots me-2"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
  
              <PostComment
                query={clientQueryPostDetailsQuery}
                postData={postData}
                metadata={metadata}
              />
            </div>
          </div>
        </div>
      );
    }
  
    if (clientQueryPostDetailsQuery.error) {
      return <ErrorPage error={clientQueryPostDetailsQuery.error} />;
    }
  
    return <LoadPage />;
};
