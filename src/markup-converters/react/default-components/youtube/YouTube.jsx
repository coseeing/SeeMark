const YouTube = ({ title, source }) => {
  return (
    <iframe
      width="560"
      height="315"
      src={source}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
};

export default YouTube;
