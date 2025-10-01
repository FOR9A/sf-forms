import { gql } from '@apollo/client';

export const GET_FORM_WITH_ANSWERS = gql`
  query getFormWithAnswers($form_id: ID!, $entity_id: ID!, $preview: Boolean) {
    getFormWithAnswers(form_id: $form_id, entity_id: $entity_id, preview: $preview) {
      id
      name
      model_type
      status
      published_at
      entity_id
      questions {
        id
        name
        type
        is_user_visible
        label {
          en
          ar
        }
        placeholder {
          en
          ar
        }
        error_message {
          en
          ar
        }
        required
        position
        settings
        has_condition
        conditionsTarget {
          id
          target_question_id
          source_question_id
          action
          comparator
          value
        }
        options {
          id
          key
          label {
            en
            ar
          }
          position
          is_other
          settings
        }
        answer {
          id
          question_id
          value_type
          value_text
          value_number
          value_date
          value_datetime
          value_boolean
          value_json
          file_path
          value_entity_id
          selected_options {
            id
            key
            label {
              en
              ar
            }
          }
        }
      }
    }
  }
`;

export const ADD_UPDATE_BULK_FORM_ANSWERS = gql`
  mutation AddUpdateBulkFormAnswers($input: BulkFormAnswerInput!) {
    addUpdateBulkFormAnswers(input: $input) {
      success
      message
      submission_id
      answers_count
      failed_answers
    }
  }
`;

export const UPLOAD_FILE = gql`
  mutation uploadFile($input: UploadFile!) {
    uploadFile(input: $input)
  }
`;
