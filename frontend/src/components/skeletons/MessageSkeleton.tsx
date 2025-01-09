const MessageSkeleton = () => {
    // Create an array of 6 items for skeleton messages
    const skeletonMessages = Array(4).fill(null);
  
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {skeletonMessages.map((_, idx) => (
          <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
            <div className="chat-image avatar">
              <div className="size-7 sm:size-10 rounded-full">
                <div className="skeleton w-full h-full rounded-full" />
              </div>
            </div>
  
            <div className="chat-header mb-1">
              <div className="skeleton sm:h-4 sm:w-16 h-2 w-6 " />
            </div>
  
            <div className="chat-bubble bg-transparent p-0">
              <div className="skeleton sm:h-16 h-10 w-[100px] sm:w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default MessageSkeleton;