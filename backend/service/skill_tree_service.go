package service

import (
	"errors"
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/module/random"
	"github.com/takiyo0/compfest/backend/repository"
	"strconv"
	"time"
)

type SkillTreeService struct {
	log logrus.FieldLogger

	llmService  *LLMService
	userService *UserService

	skillTreeRepository *repository.SkillTreeRepository
}

func NewSkillTreeService(log logrus.FieldLogger, skillTreeRepository *repository.SkillTreeRepository) *SkillTreeService {
	return &SkillTreeService{log: log, skillTreeRepository: skillTreeRepository}
}

func (s *SkillTreeService) SetLLMService(llm *LLMService) {
	s.llmService = llm
}

func (s *SkillTreeService) SetUserService(userService *UserService) {
	s.userService = userService
}

func (s *SkillTreeService) CreateSkillTree(user model.User) error {
	if user.InterviewQuestionStatus != model.InterviewQuestionStatusQuestionsFinished {
		return errors.New("user interview question status is not finished")
	}

	if user.SkillTreeStatus != model.SkillTreeStatusNotStarted {
		return errors.New("user skill tree has been generated or in progress")
	}

	if err := s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotReady); err != nil {
		return err
	}

	go func() {
		skillTrees, err := s.llmService.GenerateSkillTree(user.Topics())
		if err != nil {
			s.log.WithError(err).Error("failed to generate skill tree")
			_ = s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotStarted)
			return
		}

		mappedSkillTree := make([]model.SkillTree, 0, len(skillTrees))
		mappedEntries := make([]model.SkillTreeEntry, 0, len(skillTrees))
		for _, skillTree := range skillTrees {
			randomId := random.Int(100000000, 999999999)
			mappedSkillTree = append(mappedSkillTree, model.SkillTree{
				Id:        int64(randomId),
				Title:     skillTree.Category,
				UserId:    user.ID,
				CreatedAt: time.Now().Unix(),
			})
			for _, entry := range skillTree.Entries {
				mappedEntries = append(mappedEntries, model.SkillTreeEntry{
					Title:       entry.Title,
					Description: entry.Description,
					SkillTreeId: int64(randomId),
					CreatedAt:   time.Now().Unix(),
				})
			}
		}

		// TODO: order correctly!
		for i := 1; i < len(mappedSkillTree); i++ {
			mappedSkillTree[i-1].ChildSkillTreeIds_ = strconv.Itoa(int(mappedSkillTree[i].Id))
		}

		if err := s.skillTreeRepository.BulkCreate(mappedSkillTree); err != nil {
			s.log.WithError(err).Error("failed to insert skill trees")
			_ = s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotStarted)
			return
		}
	}()

	return nil
}
