import { FC, useCallback, useState } from "react";
import { observer } from "mobx-react";
import { FileRejection, useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
// hooks
import { TOAST_TYPE, setToast } from "@plane/ui";
import { useIssueDetail } from "@/hooks/store";
// plane web hooks
import { useFileSize } from "@/plane-web/hooks/use-file-size";
// components
import { IssueAttachmentsListItem } from "./attachment-list-item";
// types
import { IssueAttachmentDeleteModal } from "./delete-attachment-modal";
import { TAttachmentOperations } from "./root";

type TAttachmentOperationsRemoveModal = Exclude<TAttachmentOperations, "create">;

type TIssueAttachmentItemList = {
  workspaceSlug: string;
  issueId: string;
  handleAttachmentOperations: TAttachmentOperationsRemoveModal;
  disabled?: boolean;
};

export const IssueAttachmentItemList: FC<TIssueAttachmentItemList> = observer((props) => {
  const { workspaceSlug, issueId, handleAttachmentOperations, disabled } = props;
  // states
  const [isLoading, setIsLoading] = useState(false);
  // store hooks
  const {
    attachment: { getAttachmentsByIssueId },
    attachmentDeleteModalId,
    toggleDeleteAttachmentModal,
  } = useIssueDetail();
  // file size
  const { maxFileSize } = useFileSize();
  // derived values
  const issueAttachments = getAttachmentsByIssueId(issueId);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      const totalAttachedFiles = acceptedFiles.length + rejectedFiles.length;

      if (rejectedFiles.length === 0) {
        const currentFile: File = acceptedFiles[0];
        if (!currentFile || !workspaceSlug) return;

        setIsLoading(true);
        handleAttachmentOperations
          .create(currentFile)
          .catch(() => {
            setToast({
              type: TOAST_TYPE.ERROR,
              title: "Error!",
              message: "File could not be attached. Try uploading again.",
            });
          })
          .finally(() => setIsLoading(false));
        return;
      }

      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message:
          totalAttachedFiles > 1
            ? "Only one file can be uploaded at a time."
            : `File must be of ${maxFileSize / 1024 / 1024}MB or less in size.`,
      });
      return;
    },
    [handleAttachmentOperations, maxFileSize, workspaceSlug]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    multiple: false,
    disabled: isLoading || disabled,
  });

  if (!issueAttachments) return <></>;

  return (
    <>
      {attachmentDeleteModalId && (
        <IssueAttachmentDeleteModal
          isOpen={Boolean(attachmentDeleteModalId)}
          onClose={() => toggleDeleteAttachmentModal(null)}
          handleAttachmentOperations={handleAttachmentOperations}
          attachmentId={attachmentDeleteModalId}
        />
      )}
      <div
        {...getRootProps()}
        className={`relative flex flex-col ${isDragActive && issueAttachments.length < 3 ? "min-h-[200px]" : ""} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="absolute flex items-center justify-center left-0 top-0 h-full w-full bg-custom-background-90/75 z-30 ">
            <div className="flex items-center justify-center p-1 rounded-md bg-custom-background-100">
              <div className="flex flex-col justify-center items-center px-5 py-6 rounded-md border border-dashed border-custom-border-300">
                <UploadCloud className="size-7" />
                <span className="text-sm text-custom-text-300">Drag and drop anywhere to upload</span>
              </div>
            </div>
          </div>
        )}
        {issueAttachments?.map((attachmentId) => (
          <IssueAttachmentsListItem key={attachmentId} attachmentId={attachmentId} disabled={disabled} />
        ))}
      </div>
    </>
  );
});
