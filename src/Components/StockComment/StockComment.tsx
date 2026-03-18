import React, { useEffect, useState } from "react";
import StockCommentForm from "./StockCommentForm/StockCommentForm";
import { commentGetAPI, commentPostAPI } from "../../Service/CommentService";
import { toast } from "react-toastify";
import type { CommentGet } from "../../Models/Comment";
import Spinner from "../Spinners/Spinner";
import StockCommentList from "../StockCommentList/StockCommentList";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

type Props = {
  stockSymbol: string;
};

type CommentFormInputs = {
  title: string;
  content: string;
};


const StockComment = ({ stockSymbol }: Props) => {
  const [comments, setComment] = useState<CommentGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>();

  const { t } = useTranslation();
  const isZh = i18n.language === "zh";
  useEffect(() => {
    getComments();
  }, []);

  const handleComment = (e: CommentFormInputs) => {
    commentPostAPI(e.title, e.content, stockSymbol)
      .then((res) => {
        if (res) {
          {isZh ? toast.success("评论创建成功！") :toast.success("Comment created successfully!")}
          ;
          getComments();
        }
      })
      .catch((e) => {
        toast.warning(e);
      });
  };

  const getComments = () => {
    setLoading(true);
    commentGetAPI(stockSymbol)
    .then((res) => {
      setLoading(false);
      setComment(res?.data!);
    });
  };
  return (
    <div className="flex flex-col">
      {loading ? <Spinner /> : <StockCommentList comments={comments!} />}
      <StockCommentForm symbol={stockSymbol} handleComment={handleComment} />
    </div>
  );
};

export default StockComment;