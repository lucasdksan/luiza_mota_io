function NotFoundCard({
    VtexFlexLayout,
    checkList,
    titleRedCard
}) {
    return (
        <VtexFlexLayout>
            <div>
                <h2>{titleRedCard}</h2>
                <ul>
                    {checkList.map((item, index) => (
                        <li key={index}>{item.title}</li>
                    ))}
                </ul>
            </div>
        </VtexFlexLayout>
    );
}

NotFoundCard.schema = schema;

export default NotFoundCard;