import os


def build_and_push_image(project_id, image_name, image_tag):
    # Build the Docker image
    image_path = f'gcr.io/{project_id}/ingestion/connectors/pre-built/{image_name}:{image_tag}'
    build_command = f'docker build --no-cache -t {image_path} .'
    os.system(build_command)

    # Push the Docker image to Google Container Registry
    push_command = f'docker push {image_path}'
    os.system(push_command)


if __name__ == '__main__':
    project_id = 'horizon-380720'
    image_name = 'database-connector'
    image_tag = '1.0.1'

    build_and_push_image(project_id, image_name, image_tag)
